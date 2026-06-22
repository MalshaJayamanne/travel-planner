"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare,
  Search, 
  Trash2, 
  X, 
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Eye,
  Download,
  Mail,
  User
} from "lucide-react";

type Feedback = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: "FEEDBACK" | "SUPPORT" | "CONTACT";
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Moderation state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (res.ok) {
        setFeedbacks(data.feedbacks || []);
      } else {
        setError(data.error || "Failed to load feedbacks.");
      }
    } catch (err) {
      setError("An error occurred while loading feedback logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: "NEW" | "IN_PROGRESS" | "RESOLVED") => {
    try {
      setUpdatingId(feedbackId);
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId, status }),
      });

      if (res.ok) {
        setFeedbacks(prev => prev.map(f => f.id === feedbackId ? { ...f, status } : f));
        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setSelectedFeedback(prev => prev ? { ...prev, status } : null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update feedback status.");
      }
    } catch (err) {
      alert("An error occurred during updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setUpdatingId(deleteConfirm.id);
      const res = await fetch(`/api/admin/feedback?feedbackId=${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedbacks(prev => prev.filter(f => f.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete feedback.");
      }
    } catch (err) {
      alert("An error occurred during deletion.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Feedback ID", "Name", "Email", "Subject", "Category", "Status", "Message", "Created At"];
    const rows = filteredFeedbacks.map(f => [
      f.id,
      f.name,
      f.email,
      f.subject,
      f.category,
      f.status,
      f.message.replace(/"/g, '""'), // escape quotes
      new Date(f.createdAt).toISOString()
    ]);
    
    // Create CSV content with correct formatting
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feedback_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and search
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch = 
      fb.name.toLowerCase().includes(search.toLowerCase()) ||
      fb.email.toLowerCase().includes(search.toLowerCase()) ||
      fb.subject.toLowerCase().includes(search.toLowerCase()) ||
      fb.message.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === "ALL" || fb.category === filterCategory;
    const matchesStatus = filterStatus === "ALL" || fb.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">Feedback Management</h2>
          <p className="text-sm text-slate-500 mt-1">Review contact forms, bugs report, and support tickets submitted by travelers.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredFeedbacks.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export Report (CSV)
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {["ALL", "FEEDBACK", "SUPPORT", "CONTACT"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filterCategory === cat
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {["ALL", "NEW", "IN_PROGRESS", "RESOLVED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filterStatus === status
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72 mt-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-5 border border-red-200 p-6 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No support requests or feedback entries match the criteria.</p>
        </div>
      ) : (
        <div className="admin-table-container bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="admin-table w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Sender details</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Subject</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Submitted At</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFeedbacks.map((fb) => {
                  const isUpdating = updatingId === fb.id;
                  return (
                    <tr key={fb.id} className={`hover:bg-slate-50/50 transition-colors ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{fb.name}</span>
                          <span className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> {fb.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-slate-700 line-clamp-1">{fb.subject}</span>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{fb.message}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          fb.category === "SUPPORT" 
                            ? "bg-red-50 text-red-700 border-red-150" 
                            : fb.category === "CONTACT"
                            ? "bg-blue-50 text-blue-700 border-blue-150"
                            : "bg-emerald-50 text-emerald-700 border-emerald-150"
                        }`}>
                          {fb.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          fb.status === "RESOLVED"
                            ? "text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-150"
                            : fb.status === "IN_PROGRESS"
                            ? "text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-150"
                            : "text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-150"
                        }`}>
                          {fb.status === "RESOLVED" && <CheckCircle2 className="h-3 w-3" />}
                          {fb.status === "IN_PROGRESS" && <Clock className="h-3 w-3" />}
                          {fb.status === "NEW" && <HelpCircle className="h-3 w-3" />}
                          {fb.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(fb.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedFeedback(fb)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition"
                            title="Inspect Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(fb)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <section className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Inspect Request details
              </h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500">From:</span>
                  <strong className="text-slate-700">{selectedFeedback.name}</strong>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500">Email:</span>
                  <strong className="text-slate-705 text-emerald-700">{selectedFeedback.email}</strong>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Category:</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    selectedFeedback.category === "SUPPORT" ? "bg-red-50 text-red-700 border-red-150" :
                    selectedFeedback.category === "CONTACT" ? "bg-blue-50 text-blue-700 border-blue-150" :
                    "bg-emerald-50 text-emerald-700 border-emerald-150"
                  }`}>
                    {selectedFeedback.category}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</h4>
                <p className="text-sm font-bold text-slate-800">{selectedFeedback.subject}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Message Content</h4>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>

              {/* Status workflow */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                <label className="block text-xs font-semibold text-slate-500">Update Status Workflow</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["NEW", "IN_PROGRESS", "RESOLVED"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedFeedback.id, status)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        selectedFeedback.status === status
                          ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-5">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2.5 text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <section className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-5 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Feedback Log</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Permanently delete the feedback log from <strong className="text-slate-800">"{deleteConfirm.name}"</strong>? 
              <span className="text-red-600 font-semibold block mt-1">This action cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2.5 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!updatingId}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
