import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const blank = () => ({ id: undefined as string | undefined, slug: "", name: "", description: "", image_url: "", sort_order: "0", active: true });

const AdminCategories = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setItems((data as Category[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const startNew = () => { setForm(blank()); setOpen(true); };
  const startEdit = (c: Category) => {
    setForm({ id: c.id, slug: c.slug, name: c.name, description: c.description ?? "", image_url: c.image_url ?? "", sort_order: String(c.sort_order), active: c.active });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Image only");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    const payload = {
      slug: form.slug.trim() || slugify(form.name),
      name: form.name.trim(),
      description: form.description || null,
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order) || 0,
      active: form.active,
    };
    const { error, data } = form.id
      ? await supabase.from("categories").update(payload).eq("id", form.id).select().single()
      : await supabase.from("categories").insert(payload).select().single();
    setSaving(false);
    if (error) return toast.error(error.message);
    await logAudit(form.id ? "update" : "create", "category", (data as Category).id, null, payload);
    toast.success("Saved");
    setOpen(false);
    refresh();
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "category", c.id, c, null);
    toast.success("Deleted");
    refresh();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div><h1 className="text-3xl text-teal">Categories</h1><p className="text-teal/70 mt-1">Group products in the shop.</p></div>
        <Button onClick={startNew} className="rounded-full bg-terracotta hover:bg-terracotta-deep"><Plus className="h-4 w-4 mr-1" /> New category</Button>
      </div>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Slug</th><th className="text-left px-4 py-3 w-20">Order</th><th className="text-left px-4 py-3 w-24">Status</th><th className="px-4 py-3 w-24"></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No categories yet.</td></tr>}
            {items.map((c) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="px-4 py-3 text-teal font-medium">{c.name}</td>
                <td className="px-4 py-3 text-teal/70">{c.slug}</td>
                <td className="px-4 py-3 text-teal/70">{c.sort_order}</td>
                <td className="px-4 py-3"><span className={`pill text-[10px] ${c.active ? "bg-mint text-teal" : "bg-terracotta/15 text-terracotta"}`}>{c.active ? "Active" : "Hidden"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(c)} className="h-8 w-8 rounded-md hover:bg-peach text-teal flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c)} className="h-8 w-8 rounded-md hover:bg-terracotta/10 text-terracotta flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.id ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.name)} /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <Label>Image</Label>
              <div className="flex items-center gap-3 mt-2">
                {form.image_url && <img src={form.image_url} alt="" className="h-16 w-16 rounded-md object-cover bg-peach" />}
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-peach hover:bg-peach/70 text-teal px-4 py-2 text-sm font-medium">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch id="ac" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label htmlFor="ac">Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-terracotta hover:bg-terracotta-deep">{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
