import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Wordmark } from "./Wordmark";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/services", label: "Telehealth" },
  { to: "/aesthetics", label: "Aesthetics" },
  { to: "/dashboard", label: "Account" },
];

export const Header = () => {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const isHome = loc.pathname === "/";

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md ${isHome ? "bg-base/80" : "bg-base/95"} border-b border-border/60`}>
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <Wordmark className="text-teal text-2xl md:text-[1.7rem]" />

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-terracotta" : "text-teal hover:text-terracotta"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button aria-label="Search" className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-peach text-teal transition">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            aria-label={user ? "Account" : "Sign in"}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-peach text-teal transition"
          >
            <User className="h-[18px] w-[18px]" />
          </button>
          <Link to="/cart" className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-peach text-teal transition" aria-label="Cart">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-terracotta text-[11px] font-semibold text-primary-foreground flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Button asChild size="sm" className="hidden md:inline-flex rounded-full bg-teal hover:bg-teal-soft text-primary-foreground px-5">
            <Link to="/subscriptions">Subscribe</Link>
          </Button>
          <button onClick={() => setOpen((o) => !o)} className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-peach text-teal" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-base">
          <div className="container-x py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-3 px-2 text-teal font-medium border-b border-border/40">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
