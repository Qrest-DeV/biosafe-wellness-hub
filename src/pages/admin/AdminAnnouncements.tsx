import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";
import { formatDate } from "@/lib/format";

type A = {
  id: string; title: string; body: string | null;
  type: "info" | "warning" | "promo" | "success";
  active: boolean; starts_at: string | null; ends_at: string | null;
};

const blank = () => ({ id: undefined as string | undefined, title: "", body: "", type: "info" as A["type"], active: true, starts_at: "", ends_at: "" });

const AdminAnnouncements = () => {
  const [items, setItems] = useState<A[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank());

  const refresh = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setItems((data as A[]) ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const startNew = () => { setForm(blank()); setOpen(true); };
  const startEdit = (a: A) => { setForm({ id: a.id, title: a.title, body: a.body ?? "", type: a.type, active: a.active, starts_at: a.starts_at ? a.starts_at.slice(0,16) : "", ends_at: a.ends_at ? a.ends_at.slice(0,16) : "" }); setOpen(true); };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const payload = {
      title: form.title.trim(), body: form.body || null, type: form.type, active: form.active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };
    const { error, data } = form.id
      ? await supabase.from("announcements").update(payload).eq("id", form.id).select().single()
      : await supabase.from("announcements").insert(payload).select().single();
    if (error) return toast.error(error.message);
    await logAudit(form.id ? "update" : "create", "announcement", (data as A).id, null, payload);
    toast.success("Saved"); setOpen(false); refresh();
  };

  const remove = async (a: A) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "announcement", a.id, a, null); refresh();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div><h1 className="text-3xl text-teal">Announcements</h1><p className="text-teal/70 mt-1">Banners shown across the site.</p></div>
        <Button onClick={startNew} className="rounded-full bg-terracotta hover:bg-terracotta-deep"><Plus className="h-4 w-4 mr-1" /> New announcement</Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <div className="card-soft p-12 text-center text-muted-foreground">No announcements yet.</div>}
        {items.map((a) => (
          <div key={a.id} className="card-soft p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`pill text-[10px] capitalize ${a.type === "warning" ? "bg-terracotta/15 text-terracotta" : a.type === "promo" ? "bg-peach text-teal" : "bg-mint text-teal"}`}>{a.type}</span>
                <span className="font-medium text-teal">{a.title}</span>
                {!a.active && <span className="pill bg-muted text-foreground text-[10px]">Hidden</span>}
              </div>
              {a.body && <p className="text-sm text-teal/70 mt-1 line-clamp-2">{a.body}</p>}
              <div className="text-xs text-muted-foreground mt-1">{a.starts_at ? `From ${formatDate(a.starts_at)}` : ""}{a.ends_at ? ` until ${formatDate(a.ends_at)}` : ""}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => startEdit(a)} className="h-8 w-8 rounded-md hover:bg-peach text-teal flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(a)} className="h-8 w-8 rounded-md hover:bg-terracotta/10 text-terracotta flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.id ? "Edit announcement" : "New announcement"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Body</Label><Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as A["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["info","success","warning","promo"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Starts</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
              <div><Label>Ends</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch id="ac" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label htmlFor="ac">Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-terracotta hover:bg-terracotta-deep">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
