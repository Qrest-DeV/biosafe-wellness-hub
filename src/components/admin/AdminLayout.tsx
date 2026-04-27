import { ReactNode } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import { Wordmark } from "@/components/Wordmark";
import { LayoutDashboard, Package, Images, Users, ArrowLeft, LogOut } from "lucide-react";

const navItems = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/slides", label: "Hero Carousel", icon: Images },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useAdmin();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-teal">
        Loading admin…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-base flex">
      <aside className="w-64 shrink-0 border-r border-border/60 bg-card flex flex-col">
        <div className="p-6 border-b border-border/60">
          <Wordmark className="text-teal text-xl" />
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-teal text-peach" : "text-teal hover:bg-peach"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border/60 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-teal hover:bg-peach transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </button>
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-teal hover:bg-peach transition"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto">
        <div className="p-6 md:p-10 max-w-6xl">{children}</div>
      </main>
    </div>
  );
};
