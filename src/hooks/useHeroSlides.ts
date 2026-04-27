import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
  active: boolean;
  sort_order: number;
};

export const useHeroSlides = (onlyActive = true) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    let q = supabase.from("hero_slides").select("*").order("sort_order");
    if (onlyActive) q = q.eq("active", true);
    const { data } = await q;
    setSlides((data as HeroSlide[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [onlyActive]);

  return { slides, loading, refresh };
};
