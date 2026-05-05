import { ReactNode } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/context/AuthContext";
import { Wordmark } from "@/components/Wordmark";
import {
  LayoutDashboard, Package, Tags, Boxes, ShoppingCart, Ticket, BarChart3,
  Users, CreditCard, Pill, FlaskConical, Stethoscope, Images, Megaphone,
  FolderOpen, Shield, Settings, ClipboardList, ArrowLeft, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Section = "overview" | "catalog" | "sales" | "customers" | "clinical" | "marketing" | "media" | "staff" | "audit" | "settings";

type NavItem = {
  to: string;
  end?: boolean;
  label: string;
  icon: typeof LayoutDashboard;
  section: Section;
};

type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  { label: "", items: [
    { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard, section: "overview" },
  ]},
  { label: "Catalog", items: [
    { to: "/admin/products", label: "Products", icon: Package, section: "catalog" },
    { to: "/admin/categories", label: "Categories", icon: Tags, section: "catalog" },
    { to: "/admin/inventory", label: "Inventory", icon: Boxes, section: "catalog" },
  ]},
  { label: "Sales", items: [
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart, section: "sales" },
    { to: "/admin/promo-codes", label: "Promo Codes", icon: Ticket, section: "sales" },
    { to: "/admin/reports", label: "Reports", icon: BarChart3, section: "sales" },
  ]},
  { label: "Customers", items: [
    { to: "/admin/customers", label: "All Customers", icon: Users, section: "customers" },
    { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, section: "customers" },
  ]},
  { label: "Clinical", items: [
    { to: "/admin/prescriptions", label: "Prescriptions", icon: Pill, section: "clinical" },
    { to: "/admin/lab-results", label: "Lab Results", icon: FlaskConical, section: "clinical" },
    { to: "/admin/consultations", label: "Consultations", icon: Stethoscope, section: "clinical" },
  ]},
  { label: "Marketing", items: [
    { to: "/admin/slides", label: "Hero Carousel", icon: Images, section: "marketing" },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone, section: "marketing" },
  ]},
  { label: "System", items: [
    { to: "/admin/media", label: "Media Library", icon: FolderOpen, section: "media" },
    { to: "/admin/staff", label: "Staff & Roles", icon: Shield, section: "staff" },
    { to: "/admin/audit-log", label: "Audit Log", icon: ClipboardList, section: "audit" },
    { to: "/admin/settings", label: "Settings", icon: Settings, section: "settings" },
  ]},
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { hasAdminAccess, can, loading } = useRole();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth gating disabled — freely accessible
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-teal">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const SidebarContents = () => (
    <>
      <div className="p-6 border-b border-border/60">
        <Wordmark className="text-teal text-xl" />
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Admin</p>
      </div>
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((g, gi) => {
          const visible = g.items.filter((i) => can(i.section));
          if (!visible.length) return null;
          return (
            <div key={gi}>
              {g.label && <div className="px-3 mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{g.label}</div>}
              <div className="space-y-0.5">
                {visible.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        isActive ? "bg-teal text-peach" : "text-teal hover:bg-peach"
                      }`
                    }
                  >
                    <n.icon className="h-4 w-4 shrink-0" />
                    {n.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/60 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-teal hover:bg-peach transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </button>
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-teal hover:bg-peach transition"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-base flex">
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border/60 bg-card flex-col sticky top-0 h-screen">
        <SidebarContents />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-card flex flex-col" onClick={(e) => e.stopPropagation()}>
            <SidebarContents />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-card border-b border-border/60 px-4 h-14">
          <Wordmark className="text-teal text-lg" />
          <button onClick={() => setMobileOpen(true)} className="h-9 w-9 rounded-md hover:bg-peach text-teal flex items-center justify-center">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 md:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
};
