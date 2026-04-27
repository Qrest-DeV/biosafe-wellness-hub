import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/context/CartContext";
import { resolveImage } from "@/lib/assetResolver";

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  short_description: string | null;
  long_description: string | null;
  benefits: string[];
  how_to_use: string | null;
  ingredients: string | null;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
};

export const dbToProduct = (p: DbProduct): Product => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  image: resolveImage(p.image_url),
  category: p.category,
  description: p.short_description ?? "",
  benefits: p.benefits ?? [],
  howItWorks: p.long_description ?? undefined,
  usage: p.how_to_use ?? undefined,
});

export const useProducts = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    setProducts((data as DbProduct[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { products, loading, refresh };
};
