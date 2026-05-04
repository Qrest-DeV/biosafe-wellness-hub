import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { formatNaira, downloadCSV } from "@/lib/format";

const AdminReports = () => {
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{ orders: number; revenue: number; signups: number; subs: number; topProducts: { name: string; qty: number; revenue: number }[] } | null>(null);

  const run = async () => {
    const fromIso = new Date(from).toISOString();
    const toIso = new Date(to + "T23:59:59").toISOString();
    const [orders, signups, subs, items] = await Promise.all([
      supabase.from("orders").select("total, payment_status").gte("created_at", fromIso).lte("created_at", toIso),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", fromIso).lte("created_at", toIso),
      supabase.from("profiles").select("id", { count: "exact", head: true }).neq("subscription_plan", "none"),
      supabase.from("order_items").select("name_snapshot, quantity, subtotal, orders!inner(created_at)").gte("orders.created_at", fromIso).lte("orders.created_at", toIso),
    ]);
    const revenue = (orders.data ?? []).filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total || 0), 0);
    const grouped: Record<string, { qty: number; revenue: number }> = {};
    (items.data as any[] | null ?? []).forEach((it) => {
      grouped[it.name_snapshot] = grouped[it.name_snapshot] ?? { qty: 0, revenue: 0 };
      grouped[it.name_snapshot].qty += it.quantity;
      grouped[it.name_snapshot].revenue += Number(it.subtotal);
    });
    const topProducts = Object.entries(grouped).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    setData({ orders: orders.data?.length ?? 0, revenue, signups: signups.count ?? 0, subs: subs.count ?? 0, topProducts });
  };

  useEffect(() => { run(); }, []);

  const exportTop = () => data && downloadCSV("top-products.csv", data.topProducts);

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Reports</h1>
      <p className="text-teal/70 mb-6">Sales and customer insights for any date range.</p>

      <div className="card-soft p-4 flex flex-wrap items-end gap-3 mb-6">
        <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <Button onClick={run} className="bg-terracotta hover:bg-terracotta-deep">Run report</Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card-soft bg-mint p-5"><div className="text-2xl text-teal font-semibold">{formatNaira(data.revenue)}</div><div className="text-[10px] uppercase tracking-widest text-teal/70 mt-1">Revenue (paid)</div></div>
            <div className="card-soft bg-peach p-5"><div className="text-2xl text-teal font-semibold">{data.orders}</div><div className="text-[10px] uppercase tracking-widest text-teal/70 mt-1">Orders</div></div>
            <div className="card-soft p-5"><div className="text-2xl text-teal font-semibold">{data.signups}</div><div className="text-[10px] uppercase tracking-widest text-teal/70 mt-1">New signups</div></div>
            <div className="card-soft p-5"><div className="text-2xl text-teal font-semibold">{data.subs}</div><div className="text-[10px] uppercase tracking-widest text-teal/70 mt-1">Active subscribers</div></div>
          </div>

          <div className="card-soft p-6">
            <div className="flex items-end justify-between mb-4"><h2 className="text-lg font-semibold text-teal">Top products</h2><Button size="sm" variant="outline" onClick={exportTop}><Download className="h-4 w-4 mr-1" /> CSV</Button></div>
            <table className="w-full text-sm">
              <thead className="text-teal/60 text-xs uppercase tracking-widest"><tr><th className="text-left py-2">Product</th><th className="text-left py-2 w-24">Qty</th><th className="text-right py-2 w-32">Revenue</th></tr></thead>
              <tbody>
                {data.topProducts.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">No data for this range.</td></tr>}
                {data.topProducts.map((p) => (
                  <tr key={p.name} className="border-t border-border/40"><td className="py-2 text-teal">{p.name}</td><td className="py-2 text-teal">{p.qty}</td><td className="py-2 text-teal text-right">{formatNaira(p.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
