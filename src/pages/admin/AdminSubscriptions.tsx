import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";

type Row = { user_id: string; full_name: string | null; subscription_plan: string; subscription_started_at: string | null };

const AdminSubscriptions = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, subscription_plan, subscription_started_at").neq("subscription_plan", "none").order("subscription_started_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const breakdown = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => { map[r.subscription_plan] = (map[r.subscription_plan] ?? 0) + 1; });
    return map;
  }, [rows]);

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Subscriptions</h1>
      <p className="text-teal/70 mb-6">Active plan members.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-soft bg-mint p-5"><div className="text-2xl text-teal font-semibold">{rows.length}</div><div className="text-[10px] uppercase tracking-widest text-teal/70 mt-1">Total active</div></div>
        {Object.entries(breakdown).map(([plan, count]) => (
          <div key={plan} className="card-soft p-5"><div className="text-2xl text-teal font-semibold capitalize">{plan}</div><div className="text-xs text-teal/70 mt-1">{count} member{count === 1 ? "" : "s"}</div></div>
        ))}
      </div>

      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal"><tr><th className="text-left px-4 py-3">Member</th><th className="text-left px-4 py-3">Plan</th><th className="text-left px-4 py-3">Started</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">No active subscribers.</td></tr>}
            {rows.map((r) => (
              <tr key={r.user_id} className="border-t border-border/40">
                <td className="px-4 py-3 text-teal">{r.full_name ?? "—"}</td>
                <td className="px-4 py-3"><span className="pill bg-mint text-teal text-[10px] capitalize">{r.subscription_plan}</span></td>
                <td className="px-4 py-3 text-teal/70 text-xs">{r.subscription_started_at ? new Date(r.subscription_started_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
