import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Package, Images, Users, ShoppingCart, AlertTriangle, TrendingUp, CreditCard, Megaphone,
} from "lucide-react";
import { formatNaira, formatDateTime } from "@/lib/format";
import { Link } from "react-router-dom";

type Stats = {
  products: number;
  slides: number;
  customers: number;
  orders: number;
  revenue30d: number;
  signups30d: number;
  activeSubs: number;
  lowStock: number;
};

type AuditEntry = {
  id: string;
  action: string;
  entity_type: string | null;
  actor_email: string | null;
  created_at: string;
};

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    products: 0, slides: 0, customers: 0, orders: 0,
    revenue30d: 0, signups30d: 0, activeSubs: 0, lowStock: 0,
  });
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [p, s, c, o, rev, su, sub, ls, audit] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("hero_slides").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total").gte("created_at", since).eq("payment_status", "paid"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("profiles").select("id", { count: "exact", head: true }).neq("subscription_plan", "none"),
        supabase.from("products").select("id, stock_count, low_stock_threshold"),
        supabase.from("admin_audit_log").select("id, action, entity_type, actor_email, created_at").order("created_at", { ascending: false }).limit(15),
      ]);

      const revenue30d = (rev.data ?? []).reduce((sum, r) => sum + Number(r.total || 0), 0);
      const lowStock = (ls.data ?? []).filter((row) => (row.stock_count ?? 0) <= (row.low_stock_threshold ?? 0)).length;

      setStats({
        products: p.count ?? 0,
        slides: s.count ?? 0,
        customers: c.count ?? 0,
        orders: o.count ?? 0,
        revenue30d,
        signups30d: su.count ?? 0,
        activeSubs: sub.count ?? 0,
        lowStock,
      });
      setActivity((audit.data as AuditEntry[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const kpis = [
    { label: "Revenue (30d)", value: formatNaira(stats.revenue30d), icon: TrendingUp, tone: "bg-mint" },
    { label: "Orders", value: stats.orders.toLocaleString(), icon: ShoppingCart, tone: "bg-peach" },
    { label: "New signups (30d)", value: stats.signups30d.toLocaleString(), icon: Users, tone: "bg-card" },
    { label: "Active subscribers", value: stats.activeSubs.toLocaleString(), icon: CreditCard, tone: "bg-mint" },
    { label: "Products", value: stats.products.toLocaleString(), icon: Package, tone: "bg-peach" },
    { label: "Total customers", value: stats.customers.toLocaleString(), icon: Users, tone: "bg-card" },
    { label: "Hero slides", value: stats.slides.toLocaleString(), icon: Images, tone: "bg-mint" },
    { label: "Low-stock items", value: stats.lowStock.toLocaleString(), icon: AlertTriangle, tone: stats.lowStock > 0 ? "bg-terracotta/15" : "bg-card" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Admin overview</h1>
      <p className="text-teal/70 mb-8">Everything happening across your store, customers and content.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className={`${k.tone} card-soft p-4 md:p-5`}>
            <k.icon className="h-5 w-5 text-teal mb-3" />
            <div className="text-xl md:text-2xl font-semibold text-teal">{loading ? "…" : k.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-teal/70 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-soft p-6">
          <h2 className="text-lg font-semibold text-teal mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/products" className="card-soft bg-peach p-4 hover:bg-peach/70 transition"><Package className="h-5 w-5 text-teal mb-2" /><div className="text-sm font-medium text-teal">Add product</div></Link>
            <Link to="/admin/slides" className="card-soft bg-mint p-4 hover:bg-mint/70 transition"><Images className="h-5 w-5 text-teal mb-2" /><div className="text-sm font-medium text-teal">Edit carousel</div></Link>
            <Link to="/admin/orders" className="card-soft bg-card p-4 hover:bg-peach transition border border-border/60"><ShoppingCart className="h-5 w-5 text-teal mb-2" /><div className="text-sm font-medium text-teal">View orders</div></Link>
            <Link to="/admin/announcements" className="card-soft bg-card p-4 hover:bg-peach transition border border-border/60"><Megaphone className="h-5 w-5 text-teal mb-2" /><div className="text-sm font-medium text-teal">New announcement</div></Link>
          </div>
        </div>

        <div className="card-soft p-6">
          <h2 className="text-lg font-semibold text-teal mb-4">Recent admin activity</h2>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-2 text-sm border-b border-border/40 pb-2 last:border-0">
                <div className="min-w-0">
                  <div className="text-teal font-medium truncate">{a.action} <span className="text-teal/60 font-normal">on {a.entity_type ?? "—"}</span></div>
                  <div className="text-xs text-muted-foreground truncate">{a.actor_email ?? "system"}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{formatDateTime(a.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
