import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";

type C = { id: string; user_id: string; doctor_name: string | null; specialty: string | null; consultation_date: string; summary: string | null };

const AdminConsultations = () => {
  const [items, setItems] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("consultations").select("*").order("consultation_date", { ascending: false }).then(({ data }) => {
      setItems((data as C[]) ?? []); setLoading(false);
    });
  }, []);
  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Consultations</h1>
      <p className="text-teal/70 mb-6">All telehealth consultation records.</p>
      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal"><tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Doctor</th><th className="text-left px-4 py-3">Specialty</th><th className="text-left px-4 py-3">Summary</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No consultations.</td></tr>}
            {items.map((c) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="px-4 py-3 text-teal/70 text-xs">{formatDateTime(c.consultation_date)}</td>
                <td className="px-4 py-3 text-teal font-medium">{c.doctor_name ?? "—"}</td>
                <td className="px-4 py-3 text-teal/70">{c.specialty ?? "—"}</td>
                <td className="px-4 py-3 text-teal/70 truncate max-w-md">{c.summary ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default AdminConsultations;
