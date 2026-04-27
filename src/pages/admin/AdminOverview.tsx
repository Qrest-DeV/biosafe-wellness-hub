import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Package, Images, Users, ShoppingBag } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({ products: 0, slides: 0, customers: 0, prescriptions: 0 });

  useEffect(() => {
    const load = async () => {
      const [p, s, c, rx] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("hero_slides").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("prescriptions").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        products: p.count ?? 0,
        slides: s.count ?? 0,
        customers: c.count ?? 0,
        prescriptions: rx.count ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { label: "Products", value: stats.products, icon: Package, color: "bg-peach" },
    { label: "Hero Slides", value: stats.slides, icon: Images, color: "bg-mint" },
    { label: "Customers", value: stats.customers, icon: Users, color: "bg-card" },
    { label: "Prescriptions", value: stats.prescriptions, icon: ShoppingBag, color: "bg-peach" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl text-teal mb-2">Admin overview</h1>
      <p className="text-teal/70 mb-8">Manage your store, content and customers.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} card-soft p-5`}>
            <c.icon className="h-5 w-5 text-teal mb-3" />
            <div className="text-3xl font-semibold text-teal">{c.value}</div>
            <div className="text-xs uppercase tracking-widest text-teal/70 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
