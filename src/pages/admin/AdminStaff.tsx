import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";
import { useRole } from "@/hooks/useRole";

type StaffRow = { user_id: string; email: string | null; full_name: string | null; roles: string[] };

const AdminStaff = () => {
  const { isAdmin } = useRole();
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "staff" | "doctor">("staff");

  const refresh = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.rpc("admin_list_profiles_with_email"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const profiles = (profilesRes.data as { user_id: string; email: string | null; full_name: string | null }[] | null) ?? [];
    const allRoles = ((rolesRes.data as { user_id: string; role: string }[] | null) ?? []);
    const map: Record<string, StaffRow> = {};
    profiles.forEach((p) => { map[p.user_id] = { user_id: p.user_id, email: p.email, full_name: p.full_name, roles: [] }; });
    allRoles.forEach((r) => { if (map[r.user_id]) map[r.user_id].roles.push(r.role); });
    setRows(Object.values(map).filter((r) => r.roles.some((role) => role !== "user")));
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const assign = async () => {
    const target = searchEmail.trim().toLowerCase();
    if (!target) return toast.error("Enter an email");
    const { data: profilesRes } = await supabase.rpc("admin_list_profiles_with_email");
    const match = (profilesRes as { user_id: string; email: string | null }[] | null)?.find((p) => p.email?.toLowerCase() === target);
    if (!match) return toast.error("No user with that email");
    const { error } = await supabase.from("user_roles").insert({ user_id: match.user_id, role: newRole as never });
    if (error) return toast.error(error.message);
    await logAudit("assign_role", "user_role", match.user_id, null, { role: newRole });
    toast.success("Role assigned"); setOpen(false); setSearchEmail(""); refresh();
  };

  const removeRole = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as never);
    if (error) return toast.error(error.message);
    await logAudit("revoke_role", "user_role", userId, { role }, null);
    refresh();
  };

  if (!isAdmin) {
    return <AdminLayout><p className="text-teal">Admins only.</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div><h1 className="text-3xl text-teal">Staff & Roles</h1><p className="text-teal/70 mt-1">Manage who can access the admin panel.</p></div>
        <Button onClick={() => setOpen(true)} className="rounded-full bg-terracotta hover:bg-terracotta-deep"><Plus className="h-4 w-4 mr-1" /> Assign role</Button>
      </div>

      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal"><tr><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Roles</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">No staff yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.user_id} className="border-t border-border/40">
                <td className="px-4 py-3 text-teal font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {r.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-teal/70">{r.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.roles.filter((x) => x !== "user").map((role) => (
                      <span key={role} className="pill bg-mint text-teal text-[10px] capitalize">
                        {role}
                        <button onClick={() => removeRole(r.user_id, role)} className="ml-1 text-terracotta hover:text-terracotta-deep">×</button>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>User email</Label><Input value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="user@example.com" /></div>
            <div><Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as never)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (full access)</SelectItem>
                  <SelectItem value="staff">Staff (no settings/audit/staff)</SelectItem>
                  <SelectItem value="doctor">Doctor (clinical only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">The user must already have signed up.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={assign} className="bg-terracotta hover:bg-terracotta-deep">Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminStaff;
