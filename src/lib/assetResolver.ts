// Maps legacy "/src/assets/xxx.jpg" image paths used in the seeded catalog
// to their bundled imports, so existing seed data keeps rendering.
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import hero from "@/assets/hero-pharmacist.jpg";
import heroSkin from "@/assets/hero-skincare.jpg";
import heroWellness from "@/assets/hero-wellness.jpg";

const map: Record<string, string> = {
  "/src/assets/product-1.jpg": p1,
  "/src/assets/product-2.jpg": p2,
  "/src/assets/product-3.jpg": p3,
  "/src/assets/product-4.jpg": p4,
  "/src/assets/product-5.jpg": p5,
  "/src/assets/product-6.jpg": p6,
  "/src/assets/hero.jpg": hero,
  "/src/assets/hero-pharmacist.jpg": hero,
  "/src/assets/hero-skincare.jpg": heroSkin,
  "/src/assets/hero-wellness.jpg": heroWellness,
};

export const resolveImage = (url: string | null | undefined): string => {
  if (!url) return p1;
  if (map[url]) return map[url];
  return url; // remote URL (e.g. Supabase storage)
};
