import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

type Bucket = "product-images" | "hero-images" | "medical-files";

type FileEntry = { name: string; created_at?: string; metadata?: { size?: number } };

const AdminMedia = () => {
  const [bucket, setBucket] = useState<Bucket>("product-images");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from(bucket).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    setFiles((data as FileEntry[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [bucket]);

  const upload = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded"); refresh();
  };

  const remove = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from(bucket).remove([name]);
    if (error) return toast.error(error.message);
    refresh();
  };

  const url = (name: string) => bucket === "medical-files" ? null : supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl;

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Media library</h1>
      <p className="text-teal/70 mb-6">Browse and manage uploaded images and files.</p>

      <div className="flex flex-wrap items-end gap-3 mb-6">
        <Select value={bucket} onValueChange={(v) => setBucket(v as Bucket)}>
          <SelectTrigger className="w-[200px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="product-images">Product images</SelectItem>
            <SelectItem value="hero-images">Hero images</SelectItem>
            <SelectItem value="medical-files">Medical files (private)</SelectItem>
          </SelectContent>
        </Select>
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground px-5 py-2 text-sm font-medium">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
          <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Loading…</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map((f) => {
            const u = url(f.name);
            return (
              <div key={f.name} className="card-soft overflow-hidden">
                <div className="aspect-square bg-peach relative">
                  {u && /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name)
                    ? <img src={u} alt={f.name} className="absolute inset-0 h-full w-full object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center text-teal/50 text-xs p-2 break-all text-center">{f.name.split(".").pop()?.toUpperCase()}</div>
                  }
                </div>
                <div className="p-2 text-xs">
                  <div className="text-teal truncate" title={f.name}>{f.name}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground">{f.metadata?.size ? `${Math.round(f.metadata.size / 1024)} KB` : ""}</span>
                    <div className="flex gap-1">
                      {u && <button onClick={() => { navigator.clipboard.writeText(u); toast.success("Copied URL"); }} className="h-6 w-6 rounded hover:bg-peach text-teal flex items-center justify-center"><Copy className="h-3 w-3" /></button>}
                      <button onClick={() => remove(f.name)} className="h-6 w-6 rounded hover:bg-terracotta/10 text-terracotta flex items-center justify-center"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {files.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No files in this bucket.</div>}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMedia;
