import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { formatDateTime } from "@/lib/format";

type Entry = {
  id: string; actor_email: string | null; action: string;
  entity_type: string | null; entity_id: string | null;
  before: any; after: any; created_at: string;
};

const AdminAuditLog = () => {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let query = supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(500);
      const { data } = await query;
      setItems((data as Entry[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const types = Array.from(new Set(items.map((i) => i.entity_type).filter(Boolean))) as string[];

  const filtered = items.filter((i) => {
    if (entityType !== "all" && i.entity_type !== entityType) return false;
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return (i.actor_email ?? "").toLowerCase().includes(t) || i.action.toLowerCase().includes(t) || (i.entity_id ?? "").toLowerCase().includes(t);
  });

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Audit log</h1>
      <p className="text-teal/70 mb-6">Every admin action recorded. Last 500 entries.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="card-soft flex items-center gap-2 px-4 py-2 flex-1">
          <Search className="h-4 w-4 text-teal/60" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, action, or id…" className="border-0 focus-visible:ring-0 px-0 bg-transparent" />
        </div>
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-[200px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entity types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-peach text-teal"><tr><th className="text-left px-4 py-3">When</th><th className="text-left px-4 py-3">Actor</th><th className="text-left px-4 py-3">Action</th><th className="text-left px-4 py-3">Entity</th><th className="text-left px-4 py-3">ID</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No entries.</td></tr>}
            {filtered.map((e) => (
              <>
                <tr key={e.id} className="border-t border-border/40 hover:bg-peach/30 cursor-pointer" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                  <td className="px-4 py-3 text-xs text-teal/70">{formatDateTime(e.created_at)}</td>
                  <td className="px-4 py-3 text-teal">{e.actor_email ?? "—"}</td>
                  <td className="px-4 py-3 text-teal font-medium">{e.action}</td>
                  <td className="px-4 py-3 text-teal/80">{e.entity_type ?? "—"}</td>
                  <td className="px-4 py-3 text-teal/60 text-xs font-mono truncate max-w-[160px]">{e.entity_id ?? "—"}</td>
                </tr>
                {expanded === e.id && (
                  <tr key={e.id + "-d"} className="bg-peach/20">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="grid md:grid-cols-2 gap-3 text-xs">
                        <div><div className="text-teal/60 mb-1">Before</div><pre className="bg-card p-3 rounded-md overflow-auto max-h-60">{JSON.stringify(e.before, null, 2)}</pre></div>
                        <div><div className="text-teal/60 mb-1">After</div><pre className="bg-card p-3 rounded-md overflow-auto max-h-60">{JSON.stringify(e.after, null, 2)}</pre></div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLog;
