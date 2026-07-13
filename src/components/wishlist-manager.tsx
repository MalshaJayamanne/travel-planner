"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/form-field";
import { SectionCard } from "@/components/ui/section-card";

type WishlistItem = {
  id: string;
  title: string;
  destination: string;
  notes: string;
  priority: string;
};

type WishlistFormState = {
  title: string;
  destination: string;
  notes: string;
  priority: string;
};

const emptyForm: WishlistFormState = {
  title: "",
  destination: "",
  notes: "",
  priority: "Medium",
};

export function WishlistManager() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [form, setForm] = useState<WishlistFormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof WishlistFormState, string>>>({});
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadItems() {
    const response = await fetch("/api/wishlist");
    if (response.ok) {
      const data = (await response.json()) as WishlistItem[];
      setItems(data);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  function validateForm() {
    const nextErrors: Partial<Record<keyof WishlistFormState, string>> = {};

    if (form.title.trim().length < 2) {
      nextErrors.title = "Please add a title with at least 2 characters.";
    }

    if (form.destination.trim().length < 2) {
      nextErrors.destination = "Destination is required.";
    }

    if (form.notes.trim().length < 5) {
      nextErrors.notes = "Add a short note so the idea is useful.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save wishlist item.");
      }

      setItems((currentItems) => [data, ...currentItems]);
      setForm(emptyForm);
      setMessage("Wishlist item saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save wishlist item.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <SectionCard
        action={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Support</span>}
        description="Keep places and ideas you want to visit ready for the next trip plan."
        title="Wishlist planner"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={errors.title} label="Title">
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Hidden beach stay"
                value={form.title}
              />
            </FormField>

            <FormField error={errors.destination} label="Destination">
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))}
                placeholder="Bali"
                value={form.destination}
              />
            </FormField>
          </div>

          <FormField error={errors.notes} label="Notes">
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Add a short reason or idea for this place."
              rows={3}
              value={form.notes}
            />
          </FormField>

          <FormField label="Priority">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              value={form.priority}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </FormField>

          <button
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving..." : "Save wishlist item"}
          </button>
        </form>
      </SectionCard>

      <SectionCard description="Your saved inspiration list appears here." title="Saved ideas">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-600">
            No wishlist ideas yet. Add your first one to start building your travel mood board.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article className="rounded-lg border border-slate-200 p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.destination}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {item.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.notes}</p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
