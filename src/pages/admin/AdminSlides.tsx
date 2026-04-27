import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useHeroSlides, type HeroSlide } from "@/hooks/useHeroSlides";
import { resolveImage } from "@/lib/assetResolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FormState = {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_label: string;
  cta_link: string;
  active: boolean;
  sort_order: string;
};

const blank = (): FormState => ({
  title: "", subtitle: "", image_url: "", cta_label: "Shop", cta_link: "/shop", active: true, sort_order: "0",
});

const AdminSlides = () => {
  const { slides, refresh } = useHeroSlides(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const startNew = () => { setForm(blank()); setOpen(true); };
  const startEdit = (s: HeroSlide) => {
    setForm({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle ?? "",
      image_url: s.image_url ?? "",
      cta_label: s.cta_label ?? "",
      cta_link: s.cta_link ?? "",
      active: s.active,
      sort_order: String(s.sort_order),
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Image only");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("hero-images").upload(path, file, { contentType: file.type });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("hero-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success("Uploaded");
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle || null,
      image_url: form.image_url || null,
      cta_label: form.cta_label || null,
      cta_link: form.cta_link || null,
      active: form.active,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = form.id
      ? await supabase.from("hero_slides").update(payload).eq("id", form.id)
      : await supabase.from("hero_slides").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    refresh();
  };

  const handleDelete = async (s: HeroSlide) => {
    if (!confirm(`Delete slide "${s.title}"?`)) return;
    const { error } = await supabase.from("hero_slides").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl text-teal">Hero Carousel</h1>
          <p className="text-teal/70 mt-1">Slides shown at the top of the homepage.</p>
        </div>
        <Button onClick={startNew} className="rounded-full bg-terracotta hover:bg-terracotta-deep">
          <Plus className="h-4 w-4 mr-1" /> New slide
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {slides.map((s) => (
          <div key={s.id} className="card-soft overflow-hidden">
            <div className="aspect-[16/9] bg-peach relative">
              {s.image_url && (
                <img src={resolveImage(s.image_url)} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
              )}
              {!s.active && (
                <span className="absolute top-2 right-2 pill bg-terracotta text-primary-foreground text-[10px]">Hidden</span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-teal truncate">{s.title}</div>
                  {s.subtitle && <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.subtitle}</div>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => startEdit(s)} className="h-8 w-8 rounded-md hover:bg-peach text-teal flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(s)} className="h-8 w-8 rounded-md hover:bg-terracotta/10 text-terracotta flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {slides.length === 0 && (
        <div className="card-soft p-12 text-center text-muted-foreground">No slides yet. Add your first one.</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{form.id ? "Edit slide" : "New slide"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <div className="flex items-center gap-4 mt-2">
                {form.image_url && <img src={resolveImage(form.image_url)} className="h-20 w-32 object-cover rounded-md bg-peach" alt="" />}
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-peach hover:bg-peach/70 text-teal px-4 py-2 text-sm font-medium">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Textarea rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Button label</Label><Input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} /></div>
              <div><Label>Button link</Label><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/shop" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <Switch id="act" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label htmlFor="act">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-terracotta hover:bg-terracotta-deep">
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSlides;
