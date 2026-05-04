import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

type Lab = { id: string; user_id: string; title: string; result_date: string | null; notes: string | null; created_at: string };

const AdminLabResults = () => {
  const [items, setItems] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("lab_results").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setItems((data as Lab[]) ?? []); setLoading(false);
    });
  }, []);
  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Lab results</h1>
      <p className="text-teal/70 mb-6">All lab uploads across customers.</p>
      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal"><tr><th className="text-left px-4 py-3">Title</th><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Notes</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">No lab results.</td></tr>}
            {items.map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="px-4 py-3 text-teal font-medium">{r.title}</td>
                <td className="px-4 py-3 text-teal/70">{formatDate(r.result_date)}</td>
                <td className="px-4 py-3 text-teal/70 truncate max-w-xs">{r.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default AdminLabResults;
