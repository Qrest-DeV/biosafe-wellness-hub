import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, type DbProduct } from "@/hooks/useProducts";
import { categories } from "@/data/catalog";
import { resolveImage } from "@/lib/assetResolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatNaira } from "@/context/CartContext";

type FormState = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  image_url: string;
  short_description: string;
  long_description: string;
  benefits: string; // newline-separated
  how_to_use: string;
  ingredients: string;
  in_stock: boolean;
  featured: boolean;
  sort_order: string;
};

const blankForm = (): FormState => ({
  slug: "", name: "", category: "drugs", price: "0", image_url: "",
  short_description: "", long_description: "", benefits: "", how_to_use: "",
  ingredients: "", in_stock: true, featured: false, sort_order: "0",
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminProducts = () => {
  const { products, refresh } = useProducts();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const startNew = () => {
    setForm(blankForm());
    setOpen(true);
  };

  const startEdit = (p: DbProduct) => {
    setForm({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: String(p.price),
      image_url: p.image_url ?? "",
      short_description: p.short_description ?? "",
      long_description: p.long_description ?? "",
      benefits: (p.benefits ?? []).join("\n"),
      how_to_use: p.how_to_use ?? "",
      ingredients: p.ingredients ?? "",
      in_stock: p.in_stock,
      featured: p.featured,
      sort_order: String(p.sort_order),
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
    });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug.trim() || slugify(form.name),
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price) || 0,
      image_url: form.image_url || null,
      short_description: form.short_description || null,
      long_description: form.long_description || null,
      benefits: form.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
      how_to_use: form.how_to_use || null,
      ingredients: form.ingredients || null,
      in_stock: form.in_stock,
      featured: form.featured,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Product updated" : "Product created");
    setOpen(false);
    refresh();
  };

  const handleDelete = async (p: DbProduct) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted");
    refresh();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl text-teal">Products</h1>
          <p className="text-teal/70 mt-1">Manage everything that appears in the shop.</p>
        </div>
        <Button onClick={startNew} className="rounded-full bg-terracotta hover:bg-terracotta-deep">
          <Plus className="h-4 w-4 mr-1" /> New product
        </Button>
      </div>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Status</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImage(p.image_url)}
                      alt={p.name}
                      className="h-10 w-10 rounded-md object-cover bg-peach"
                    />
                    <div>
                      <div className="font-medium text-teal">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell capitalize text-teal/80">{p.category}</td>
                <td className="px-4 py-3 text-teal">{formatNaira(Number(p.price))}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.featured && <span className="pill bg-mint text-teal text-[10px]">Featured</span>}
                    {!p.in_stock && <span className="pill bg-terracotta/20 text-terracotta text-[10px]">Out of stock</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(p)} className="h-8 w-8 rounded-md hover:bg-peach text-teal flex items-center justify-center">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="h-8 w-8 rounded-md hover:bg-terracotta/10 text-terracotta flex items-center justify-center">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <div className="flex items-center gap-4 mt-2">
                {form.image_url && (
                  <img src={resolveImage(form.image_url)} alt="" className="h-20 w-20 rounded-md object-cover bg-peach" />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-peach hover:bg-peach/70 text-teal px-4 py-2 text-sm font-medium">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder={slugify(form.name)}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (₦)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Short description</Label>
              <Textarea rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
            <div>
              <Label>Benefits (one per line)</Label>
              <Textarea rows={4} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder={"Reduces fever within 30 minutes\nGentle on the stomach"} />
            </div>
            <div>
              <Label>How to use</Label>
              <Textarea rows={2} value={form.how_to_use} onChange={(e) => setForm({ ...form, how_to_use: e.target.value })} />
            </div>
            <div>
              <Label>How it works (long description)</Label>
              <Textarea rows={3} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} />
            </div>
            <div>
              <Label>Ingredients</Label>
              <Textarea rows={2} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} id="stock" />
                <Label htmlFor="stock">In stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="featured" />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-terracotta hover:bg-terracotta-deep">
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {form.id ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
