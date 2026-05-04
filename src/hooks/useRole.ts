import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type Role = "admin" | "staff" | "doctor" | "user";

export const useRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!user) {
        setRoles([]); setLoading(false); return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (!cancelled) {
        setRoles(((data as { role: Role }[]) ?? []).map((r) => r.role));
        setLoading(false);
      }
    };
    if (!authLoading) check();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const isAdmin = roles.includes("admin");
  const isStaff = roles.includes("staff");
  const isDoctor = roles.includes("doctor");
  const hasAdminAccess = isAdmin || isStaff || isDoctor;

  const can = (section: "settings" | "audit" | "staff" | "clinical" | "sales" | "catalog" | "marketing" | "customers" | "media" | "overview") => {
    if (isAdmin) return true;
    if (section === "settings" || section === "audit" || section === "staff") return false;
    if (isStaff) return section !== "clinical" || isDoctor;
    if (isDoctor) return section === "clinical" || section === "customers" || section === "overview";
    return false;
  };

  return { roles, isAdmin, isStaff, isDoctor, hasAdminAccess, can, loading: loading || authLoading };
};
