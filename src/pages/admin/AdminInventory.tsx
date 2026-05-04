import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";

type Item = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  stock_count: number;
  low_stock_threshold: number;
  in_stock: boolean;
};

const AdminInventory = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Record<string, { stock?: string; threshold?: string; sku?: string }>>({});

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("id, name, sku, category, stock_count, low_stock_threshold, in_stock").order("name");
    setItems((data as Item[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => i.name.toLowerCase().includes(t) || (i.sku ?? "").toLowerCase().includes(t));
  }, [items, q]);

  const lowStockCount = items.filter((i) => i.stock_count <= i.low_stock_threshold).length;

  const save = async (item: Item) => {
    const d = draft[item.id] ?? {};
    const payload: Partial<Item> = {};
    if (d.stock !== undefined) payload.stock_count = Number(d.stock) || 0;
    if (d.threshold !== undefined) payload.low_stock_threshold = Number(d.threshold) || 0;
    if (d.sku !== undefined) payload.sku = d.sku || null as never;
    if (!Object.keys(payload).length) return;
    const { error } = await supabase.from("products").update(payload).eq("id", item.id);
    if (error) return toast.error(error.message);
    await logAudit("update", "product_inventory", item.id, item, payload);
    toast.success("Updated");
    setDraft((p) => { const n = { ...p }; delete n[item.id]; return n; });
    refresh();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl text-teal">Inventory</h1>
          <p className="text-teal/70 mt-1">Track stock levels and low-stock alerts.</p>
        </div>
        {lowStockCount > 0 && (
          <div className="pill bg-terracotta/15 text-terracotta"><AlertTriangle className="h-3.5 w-3.5" /> {lowStockCount} low-stock item{lowStockCount === 1 ? "" : "s"}</div>
        )}
      </div>

      <div className="card-soft flex items-center gap-2 px-4 py-2 mb-4 max-w-md">
        <Search className="h-4 w-4 text-teal/60" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or SKU…" className="border-0 focus-visible:ring-0 px-0 bg-transparent" />
      </div>

      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-peach text-teal">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3 w-32">Stock</th>
              <th className="text-left px-4 py-3 w-32">Low threshold</th>
              <th className="text-left px-4 py-3 w-24">Status</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {filtered.map((i) => {
              const low = i.stock_count <= i.low_stock_threshold;
              const d = draft[i.id] ?? {};
              return (
                <tr key={i.id} className="border-t border-border/40">
                  <td className="px-4 py-3 text-teal font-medium">{i.name}<div className="text-xs text-muted-foreground capitalize">{i.category}</div></td>
                  <td className="px-4 py-3"><Input value={d.sku ?? i.sku ?? ""} onChange={(e) => setDraft((p) => ({ ...p, [i.id]: { ...p[i.id], sku: e.target.value } }))} className="h-8" /></td>
                  <td className="px-4 py-3"><Input type="number" value={d.stock ?? String(i.stock_count)} onChange={(e) => setDraft((p) => ({ ...p, [i.id]: { ...p[i.id], stock: e.target.value } }))} className="h-8 w-24" /></td>
                  <td className="px-4 py-3"><Input type="number" value={d.threshold ?? String(i.low_stock_threshold)} onChange={(e) => setDraft((p) => ({ ...p, [i.id]: { ...p[i.id], threshold: e.target.value } }))} className="h-8 w-24" /></td>
                  <td className="px-4 py-3">
                    {!i.in_stock ? <span className="pill bg-terracotta/15 text-terracotta text-[10px]">Off</span>
                      : low ? <span className="pill bg-terracotta/15 text-terracotta text-[10px]">Low</span>
                      : <span className="pill bg-mint text-teal text-[10px]">OK</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {draft[i.id] && <Button size="sm" onClick={() => save(i)} className="h-8 bg-terracotta hover:bg-terracotta-deep">Save</Button>}
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No products.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
