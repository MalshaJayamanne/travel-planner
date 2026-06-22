"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Users,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  AlertCircle,
  Calendar,
  Compass,
  Crown,
} from "lucide-react";

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "ADMIN" | "TRAVELER";
  isActive: boolean;
  createdAt: string;
  _count: {
    trips: number;
  };
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserRecord | null>(null);

  const fetchUsers = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to load users.");
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleToggleStatus = async (user: UserRecord) => {
    setActioningUserId(user.id);
    const action = user.isActive ? "suspend" : "reactivate";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to update user.");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setActioningUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const targetId = deleteConfirmUser.id;
    setActioningUserId(targetId);
    try {
      const res = await fetch(`/api/admin/users?userId=${targetId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete user.");
      }
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      setDeleteConfirmUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setActioningUserId(null);
    }
  };

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const suspendedCount = totalUsers - activeCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage all registered accounts — suspend, reactivate, or permanently delete users.
          </p>
        </div>
        {/* Mini Stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <Users className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-slate-800 font-bold">{totalUsers}</span> Total
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
            <UserCheck className="h-3.5 w-3.5" />
            <span className="font-bold">{activeCount}</span> Active
          </div>
          {suspendedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-600">
              <UserX className="h-3.5 w-3.5" />
              <span className="font-bold">{suspendedCount}</span> Suspended
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); fetchUsers(""); }}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 text-sm transition-colors border border-slate-200"
          >
            Clear
          </button>
        )}
      </form>

      {/* Table / States */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 admin-stat-card">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No users found matching your search.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trips</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isActioning = actioningUserId === user.id;
                  const avatarUrl =
                    user.image ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`;

                  return (
                    <tr key={user.id} className={isActioning ? "opacity-50 pointer-events-none" : ""}>
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={avatarUrl}
                              alt={user.name || "User"}
                              className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                            {!user.isActive && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {user.name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Crown className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Users className="h-3 w-3" />
                            Traveler
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Trips */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Compass className="h-3.5 w-3.5 text-slate-400" />
                          {user._count.trips}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.role !== "ADMIN" && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={isActioning}
                              title={user.isActive ? "Suspend User" : "Reactivate User"}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                user.isActive
                                  ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              }`}
                            >
                              {user.isActive ? (
                                <><UserX className="h-3.5 w-3.5" /> Suspend</>
                              ) : (
                                <><UserCheck className="h-3.5 w-3.5" /> Reactivate</>
                              )}
                            </button>
                          )}

                          {user.role !== "ADMIN" && (
                            <button
                              onClick={() => setDeleteConfirmUser(user)}
                              disabled={isActioning}
                              title="Delete User"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                          {user.role === "ADMIN" && (
                            <span className="text-xs text-slate-400 italic">Protected</span>
                          )}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <section className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 border border-red-200">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete User Account</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Permanently delete{" "}
              <strong className="text-slate-800">{deleteConfirmUser.name || deleteConfirmUser.email}</strong>?
              This will remove all their trips, expenses, itineraries, and data.{" "}
              <span className="text-red-600 font-semibold">This cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={!!actioningUserId}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-60"
              >
                {actioningUserId ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          Admin accounts are protected and cannot be suspended or deleted from this panel.
          Suspended users lose access immediately and cannot sign in until reactivated.
        </p>
      </div>
    </div>
  );
}
