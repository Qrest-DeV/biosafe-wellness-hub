import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, ChevronRight, Download, Truck } from "lucide-react";
import { formatNaira, formatDateTime, downloadCSV } from "@/lib/format";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";

type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  promo_code: string | null;
  shipping_address: any;
  tracking_number: string | null;
  carrier: string | null;
  notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_id: string | null;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
};

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

const statusPill = (s: string) => {
  const map: Record<string, string> = {
    pending: "bg-muted text-foreground",
    paid: "bg-mint text-teal",
    processing: "bg-peach text-teal",
    shipped: "bg-mint text-teal",
    delivered: "bg-mint text-teal",
    cancelled: "bg-terracotta/15 text-terracotta",
    refunded: "bg-terracotta/15 text-terracotta",
  };
  return map[s] ?? "bg-muted text-foreground";
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");
  const [notes, setNotes] = useState("");

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!selected) { setItems([]); return; }
    setTracking(selected.tracking_number ?? "");
    setCarrier(selected.carrier ?? "");
    setNotes(selected.notes ?? "");
    supabase.from("order_items").select("*").eq("order_id", selected.id).then(({ data }) => setItems((data as OrderItem[]) ?? []));
  }, [selected]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!t) return true;
      return o.order_number.toLowerCase().includes(t) || (o.tracking_number ?? "").toLowerCase().includes(t);
    });
  }, [orders, q, status]);

  const updateOrder = async (patch: Record<string, unknown>) => {
    if (!selected) return;
    const { error, data } = await supabase.from("orders").update(patch as never).eq("id", selected.id).select().single();
    if (error) return toast.error(error.message);
    await logAudit("update", "order", selected.id, selected, patch);
    toast.success("Order updated");
    setSelected(data as Order);
    refresh();
  };

  const exportCSV = () => {
    downloadCSV("orders.csv", filtered.map((o) => ({
      order_number: o.order_number,
      status: o.status,
      payment_status: o.payment_status,
      total: o.total,
      currency: o.currency,
      created_at: o.created_at,
      tracking_number: o.tracking_number ?? "",
    })));
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="text-3xl text-teal">Orders</h1><p className="text-teal/70 mt-1">{orders.length} orders total.</p></div>
        <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="card-soft flex items-center gap-2 px-4 py-2 flex-1">
          <Search className="h-4 w-4 text-teal/60" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order # or tracking…" className="border-0 focus-visible:ring-0 px-0 bg-transparent" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-peach text-teal">
            <tr>
              <th className="text-left px-4 py-3">Order #</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No orders.</td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border/40 hover:bg-peach/30 cursor-pointer" onClick={() => setSelected(o)}>
                <td className="px-4 py-3 text-teal font-medium">{o.order_number}</td>
                <td className="px-4 py-3 text-teal/70 text-xs">{formatDateTime(o.created_at)}</td>
                <td className="px-4 py-3"><span className={`pill text-[10px] capitalize ${statusPill(o.status)}`}>{o.status}</span></td>
                <td className="px-4 py-3"><span className={`pill text-[10px] capitalize ${statusPill(o.payment_status)}`}>{o.payment_status}</span></td>
                <td className="px-4 py-3 text-teal font-medium">{formatNaira(Number(o.total))}</td>
                <td className="px-4 py-3"><ChevronRight className="h-4 w-4 text-teal/50" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected?.order_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              <section className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={selected.status} onValueChange={(v) => updateOrder({ status: v as never })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment status</Label>
                  <Select value={selected.payment_status} onValueChange={(v) => updateOrder({ payment_status: v as never })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["unpaid","paid","refunded","failed"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Items</h3>
                <div className="card-soft divide-y divide-border/40">
                  {items.map((it) => (
                    <div key={it.id} className="p-3 flex justify-between text-sm">
                      <div><div className="text-teal font-medium">{it.name_snapshot}</div><div className="text-xs text-muted-foreground">{formatNaira(Number(it.price_snapshot))} × {it.quantity}</div></div>
                      <div className="text-teal font-medium">{formatNaira(Number(it.subtotal))}</div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="p-3 text-sm text-muted-foreground">No items.</div>}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-teal/60">Subtotal</dt><dd className="text-right text-teal">{formatNaira(Number(selected.subtotal))}</dd>
                  <dt className="text-teal/60">Shipping</dt><dd className="text-right text-teal">{formatNaira(Number(selected.shipping))}</dd>
                  <dt className="text-teal/60">Tax</dt><dd className="text-right text-teal">{formatNaira(Number(selected.tax))}</dd>
                  {Number(selected.discount) > 0 && <><dt className="text-teal/60">Discount</dt><dd className="text-right text-teal">−{formatNaira(Number(selected.discount))}</dd></>}
                  <dt className="text-teal font-semibold">Total</dt><dd className="text-right text-teal font-semibold">{formatNaira(Number(selected.total))}</dd>
                </dl>
              </section>

              {selected.shipping_address && (
                <section>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Shipping address</h3>
                  <div className="card-soft p-3 text-sm text-teal whitespace-pre-line">
                    {[selected.shipping_address.full_name, selected.shipping_address.line1, selected.shipping_address.line2, [selected.shipping_address.city, selected.shipping_address.state].filter(Boolean).join(", "), selected.shipping_address.postal_code, selected.shipping_address.country, selected.shipping_address.phone].filter(Boolean).join("\n")}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1"><Truck className="h-3 w-3" /> Shipping</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Carrier</Label><Input value={carrier} onChange={(e) => setCarrier(e.target.value)} /></div>
                  <div><Label>Tracking number</Label><Input value={tracking} onChange={(e) => setTracking(e.target.value)} /></div>
                </div>
                <Button size="sm" className="mt-2 bg-terracotta hover:bg-terracotta-deep" onClick={() => updateOrder({ tracking_number: tracking || null, carrier: carrier || null })}>Save shipping</Button>
              </section>

              <section>
                <Label>Internal notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                <Button size="sm" className="mt-2" variant="outline" onClick={() => updateOrder({ notes: notes || null })}>Save notes</Button>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
