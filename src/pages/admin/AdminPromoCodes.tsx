import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";
import { formatDate } from "@/lib/format";

type Promo = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

const blank = () => ({ id: undefined as string | undefined, code: "", description: "", discount_type: "percent" as "percent" | "fixed", discount_value: "10", min_order: "0", max_uses: "", active: true, expires_at: "" });

const AdminPromoCodes = () => {
  const [items, setItems] = useState<Promo[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setItems((data as Promo[]) ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const startNew = () => { setForm(blank()); setOpen(true); };
  const startEdit = (p: Promo) => setForm({
    id: p.id, code: p.code, description: p.description ?? "", discount_type: p.discount_type,
    discount_value: String(p.discount_value), min_order: String(p.min_order),
    max_uses: p.max_uses ? String(p.max_uses) : "", active: p.active,
    expires_at: p.expires_at ? p.expires_at.slice(0, 10) : "",
  });

  const save = async () => {
    if (!form.code.trim()) return toast.error("Code required");
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      min_order: Number(form.min_order) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      active: form.active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
    const { error, data } = form.id
      ? await supabase.from("promo_codes").update(payload).eq("id", form.id).select().single()
      : await supabase.from("promo_codes").insert(payload).select().single();
    setSaving(false);
    if (error) return toast.error(error.message);
    await logAudit(form.id ? "update" : "create", "promo_code", (data as Promo).id, null, payload);
    toast.success("Saved"); setOpen(false); refresh();
  };

  const remove = async (p: Promo) => {
    if (!confirm(`Delete code ${p.code}?`)) return;
    const { error } = await supabase.from("promo_codes").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "promo_code", p.id, p, null);
    refresh();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div><h1 className="text-3xl text-teal">Promo Codes</h1><p className="text-teal/70 mt-1">Discounts customers can apply at checkout.</p></div>
        <Button onClick={startNew} className="rounded-full bg-terracotta hover:bg-terracotta-deep"><Plus className="h-4 w-4 mr-1" /> New code</Button>
      </div>

      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-peach text-teal">
            <tr><th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Discount</th><th className="text-left px-4 py-3">Used</th><th className="text-left px-4 py-3">Expires</th><th className="text-left px-4 py-3">Status</th><th className="px-4 py-3 w-24"></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No promo codes.</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="px-4 py-3 text-teal font-mono font-semibold">{p.code}</td>
                <td className="px-4 py-3 text-teal">{p.discount_type === "percent" ? `${p.discount_value}%` : `₦${Number(p.discount_value).toLocaleString()}`}</td>
                <td className="px-4 py-3 text-teal/70">{p.used_count}{p.max_uses ? ` / ${p.max_uses}` : ""}</td>
                <td className="px-4 py-3 text-teal/70">{p.expires_at ? formatDate(p.expires_at) : "—"}</td>
                <td className="px-4 py-3"><span className={`pill text-[10px] ${p.active ? "bg-mint text-teal" : "bg-terracotta/15 text-terracotta"}`}>{p.active ? "Active" : "Off"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { startEdit(p); setOpen(true); }} className="h-8 w-8 rounded-md hover:bg-peach text-teal flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p)} className="h-8 w-8 rounded-md hover:bg-terracotta/10 text-terracotta flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.id ? "Edit code" : "New code"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as never })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percent">Percent</SelectItem><SelectItem value="fixed">Fixed (₦)</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Value</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></div>
              <div><Label>Min order (₦)</Label><Input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} /></div>
              <div><Label>Max uses</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" /></div>
              <div><Label>Expires</Label><Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
              <div className="flex items-end gap-2"><Switch id="ac" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label htmlFor="ac">Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-terracotta hover:bg-terracotta-deep">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPromoCodes;
