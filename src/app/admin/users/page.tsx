"use client";

import { useEffect, useState, useMemo } from "react";
import { User, ShieldAlert, Key, Trash2 } from "lucide-react";
import { adminGlassCard, AdminEmpty } from "@/components/admin/admin-ui";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  hospital: {
    hospitalName: string;
    sectorCode: string;
  } | null;
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Failed to fetch users");
      else setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading users");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      setUpdatingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update role");
      } else {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (e) {
      alert("Error updating role");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Are you sure you want to permanently remove the user ${email}? This action cannot be undone.`)) return;

    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
      } else {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (e) {
      alert("Error deleting user");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const okSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const okRole = roleFilter === "all" || u.role === roleFilter;
      return okSearch && okRole;
    });
  }, [users, search, roleFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error) return <AdminEmpty title="Users unavailable" body={error} />;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Access Control</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Users & Roles</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
            Manage user accounts across all organizations. Grant system administrator privileges, review login history, and audit access levels.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full max-w-sm border-[#d5ddd6] bg-white/80 text-sm"
        />
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value ?? "all")}>
          <SelectTrigger className="h-9 w-[180px] border-[#d5ddd6] bg-white/80 text-sm">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="ADMIN">System Admin</SelectItem>
            <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
            <SelectItem value="user">Standard User</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-[#3d5248]">
          Showing {filtered.length} users
        </span>
      </div>

      {filtered.length === 0 ? (
        <AdminEmpty title="No users found" body="Try adjusting your search criteria." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((user) => (
            <div key={user.id} className={adminGlassCard("min-h-[140px] flex flex-col justify-between p-5")}>
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-[#00673F]/10 text-[#00673F]'}`}>
                  {user.role === 'ADMIN' ? <ShieldAlert className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="truncate text-base font-semibold text-[#15221a]">{user.fullName}</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50 -mt-1 -mr-1"
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={updatingId === user.id}
                      title="Remove User"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    {user.hospital ? (
                      <Badge variant="outline" className="text-[10px] truncate max-w-[150px]">
                        {user.hospital.hospitalName}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">
                        No Organization
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Joined</span>
                  <span className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last Login</span>
                  <span className="text-xs font-medium">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1"><Key className="w-3 h-3"/> Privilege Level</span>
                  <Select 
                    value={user.role} 
                    onValueChange={(val) => { if (val) handleRoleChange(user.id, val); }}
                    disabled={updatingId === user.id}
                  >
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">System Admin</SelectItem>
                      <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                      <SelectItem value="user">Standard User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
