import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, ShieldCheck, ChevronRight, X, Filter } from "lucide-react";

type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  email: string | null;
  blood_type: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  allergies: string[];
  chronic_conditions: string[];
  subscription_plan: string;
  verified_patient: boolean;
  created_at: string;
};

type PlanFilter = "all" | "none" | "essential" | "plus" | "pro";
type VerifiedFilter = "all" | "verified" | "unverified";

const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState<PlanFilter>("all");
  const [verified, setVerified] = useState<VerifiedFilter>("all");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [counts, setCounts] = useState<{ rx: number; labs: number; consults: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("admin_list_profiles_with_email");
      if (!error) setProfiles((data as Profile[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selected) { setCounts(null); return; }
    const load = async () => {
      const [rx, labs, consults] = await Promise.all([
        supabase.from("prescriptions").select("id", { count: "exact", head: true }).eq("user_id", selected.user_id),
        supabase.from("lab_results").select("id", { count: "exact", head: true }).eq("user_id", selected.user_id),
        supabase.from("consultations").select("id", { count: "exact", head: true }).eq("user_id", selected.user_id),
      ]);
      setCounts({ rx: rx.count ?? 0, labs: labs.count ?? 0, consults: consults.count ?? 0 });
    };
    load();
  }, [selected]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return profiles.filter((p) => {
      if (plan !== "all" && p.subscription_plan !== plan) return false;
      if (verified === "verified" && !p.verified_patient) return false;
      if (verified === "unverified" && p.verified_patient) return false;
      if (!term) return true;
      return (
        (p.full_name ?? "").toLowerCase().includes(term) ||
        (p.username ?? "").toLowerCase().includes(term) ||
        (p.phone ?? "").toLowerCase().includes(term) ||
        (p.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [profiles, q, plan, verified]);

  const activeFilterCount = (plan !== "all" ? 1 : 0) + (verified !== "all" ? 1 : 0);
  const clearAll = () => { setQ(""); setPlan("all"); setVerified("all"); };

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Customers</h1>
      <p className="text-teal/70 mb-6">Search by name, username, phone, or email. Health details stay private — only summary visible.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="card-soft flex items-center gap-2 px-4 py-2 flex-1 min-w-0">
          <Search className="h-4 w-4 text-teal/60 shrink-0" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, username, phone, or email…"
            className="border-0 focus-visible:ring-0 px-0 bg-transparent"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-teal/50 hover:text-teal" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={plan} onValueChange={(v) => setPlan(v as PlanFilter)}>
            <SelectTrigger className="w-[140px] bg-card">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="none">No plan</SelectItem>
              <SelectItem value="essential">Essential</SelectItem>
              <SelectItem value="plus">Plus</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verified} onValueChange={(v) => setVerified(v as VerifiedFilter)}>
            <SelectTrigger className="w-[150px] bg-card">
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All patients</SelectItem>
              <SelectItem value="verified">Verified only</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          {(activeFilterCount > 0 || q) && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-teal/70">
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-teal/60 mb-3">
        <Filter className="h-3 w-3" />
        <span>
          {loading ? "Loading…" : `${filtered.length} of ${profiles.length} customer${profiles.length === 1 ? "" : "s"}`}
          {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied`}
        </span>
      </div>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-peach text-teal">
            <tr>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Email</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Plan</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border/40 hover:bg-peach/30 cursor-pointer" onClick={() => setSelected(p)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-teal">{p.full_name || p.username || "Unnamed"}</div>
                    {p.verified_patient && <ShieldCheck className="h-4 w-4 text-teal" />}
                  </div>
                  <div className="text-xs text-muted-foreground">@{p.username ?? "—"}</div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-teal/80 truncate max-w-[220px]">{p.email ?? "—"}</td>
                <td className="px-4 py-3 hidden md:table-cell text-teal/80">{p.phone ?? "—"}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="pill bg-mint text-teal text-[10px] capitalize">{p.subscription_plan}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-teal/70 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right"><ChevronRight className="h-4 w-4 text-teal/50 inline" /></td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No customers match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.full_name || selected?.username || "Customer"}
              {selected?.verified_patient && <ShieldCheck className="h-4 w-4 text-teal" />}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <section>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Profile</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-teal/60">Username</dt><dd className="text-teal">@{selected.username ?? "—"}</dd>
                  <dt className="text-teal/60">Email</dt><dd className="text-teal break-all">{selected.email ?? "—"}</dd>
                  <dt className="text-teal/60">Phone</dt><dd className="text-teal">{selected.phone ?? "—"}</dd>
                  <dt className="text-teal/60">Plan</dt><dd className="text-teal capitalize">{selected.subscription_plan}</dd>
                  <dt className="text-teal/60">Joined</dt><dd className="text-teal">{new Date(selected.created_at).toLocaleDateString()}</dd>
                </dl>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Health summary</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-teal/60">Blood type</dt><dd className="text-teal">{selected.blood_type ?? "—"}</dd>
                  <dt className="text-teal/60">Age</dt><dd className="text-teal">{selected.age ?? "—"}</dd>
                  <dt className="text-teal/60">Weight</dt><dd className="text-teal">{selected.weight_kg ? `${selected.weight_kg} kg` : "—"}</dd>
                  <dt className="text-teal/60">Height</dt><dd className="text-teal">{selected.height_cm ? `${selected.height_cm} cm` : "—"}</dd>
                </dl>
                {selected.allergies?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-teal/60 mb-1">Allergies</div>
                    <div className="flex flex-wrap gap-1">
                      {selected.allergies.map((a) => <span key={a} className="pill bg-terracotta/15 text-terracotta text-[10px]">{a}</span>)}
                    </div>
                  </div>
                )}
                {selected.chronic_conditions?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-teal/60 mb-1">Chronic conditions</div>
                    <div className="flex flex-wrap gap-1">
                      {selected.chronic_conditions.map((c) => <span key={c} className="pill bg-mint text-teal text-[10px]">{c}</span>)}
                    </div>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Records (counts only)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="card-soft p-3 text-center">
                    <div className="text-2xl text-teal font-semibold">{counts?.rx ?? "…"}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Prescriptions</div>
                  </div>
                  <div className="card-soft p-3 text-center">
                    <div className="text-2xl text-teal font-semibold">{counts?.labs ?? "…"}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Lab results</div>
                  </div>
                  <div className="card-soft p-3 text-center">
                    <div className="text-2xl text-teal font-semibold">{counts?.consults ?? "…"}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Consults</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Detailed medical contents are not shown here for privacy.</p>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCustomers;
