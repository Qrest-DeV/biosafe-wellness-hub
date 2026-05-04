import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

type Rx = { id: string; user_id: string; name: string; dosage: string | null; frequency: string | null; refill_date: string | null; active: boolean; created_at: string };

const AdminPrescriptions = () => {
  const [items, setItems] = useState<Rx[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("prescriptions").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setItems((data as Rx[]) ?? []); setLoading(false);
    });
  }, []);
  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Prescriptions</h1>
      <p className="text-teal/70 mb-6">All prescriptions across customers.</p>
      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal"><tr><th className="text-left px-4 py-3">Medication</th><th className="text-left px-4 py-3">Dosage</th><th className="text-left px-4 py-3">Frequency</th><th className="text-left px-4 py-3">Refill</th><th className="text-left px-4 py-3">Status</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No prescriptions.</td></tr>}
            {items.map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="px-4 py-3 text-teal font-medium">{r.name}</td>
                <td className="px-4 py-3 text-teal/70">{r.dosage ?? "—"}</td>
                <td className="px-4 py-3 text-teal/70">{r.frequency ?? "—"}</td>
                <td className="px-4 py-3 text-teal/70">{formatDate(r.refill_date)}</td>
                <td className="px-4 py-3"><span className={`pill text-[10px] ${r.active ? "bg-mint text-teal" : "bg-muted text-foreground"}`}>{r.active ? "Active" : "Inactive"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default AdminPrescriptions;
