import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import { Product } from "@/context/CartContext";

export const categories = [
  { slug: "drugs", name: "Drugs", desc: "Prescription & OTC", emoji: "℞" },
  { slug: "supplements", name: "Supplements", desc: "Vitamins & minerals", emoji: "✦" },
  { slug: "skincare", name: "Skincare", desc: "Daily rituals", emoji: "❀" },
  { slug: "wellness", name: "Wellness", desc: "Lifestyle goods", emoji: "✿" },
];

export const products: Product[] = [
  { id: "p1", name: "Paracetamol 500mg", price: 1200, image: p1, category: "drugs", description: "Fast-acting relief for fever and mild pain. 24 tablets per pack.", badge: "Bestseller" },
  { id: "p2", name: "Vitamin C Brightening Serum", price: 8500, image: p2, category: "skincare", description: "10% Vitamin C serum that brightens, evens tone and fades marks." },
  { id: "p3", name: "Hydra Repair Moisturiser", price: 6900, image: p3, category: "skincare", description: "Lightweight ceramide cream for daily hydration and barrier repair." },
  { id: "p4", name: "Daily Multivitamin", price: 5400, image: p4, category: "supplements", description: "Complete A–Z multivitamin with iron and zinc, 60 capsules.", badge: "New" },
  { id: "p5", name: "Cold-Pressed Green Juice", price: 2500, image: p5, category: "wellness", description: "Cucumber, apple, ginger and spinach. Daily glow in a bottle." },
  { id: "p6", name: "Mineral Sunscreen SPF 50", price: 9800, image: p6, category: "skincare", description: "Lightweight, non-greasy SPF 50 — safe for melanin-rich skin.", badge: "Loved" },
  { id: "p7", name: "Ibuprofen 400mg", price: 1500, image: p1, category: "drugs", description: "Anti-inflammatory pain relief. 20 tablets." },
  { id: "p8", name: "Omega-3 Fish Oil", price: 7200, image: p4, category: "supplements", description: "1000mg high-purity omega-3 for heart and brain support." },
  { id: "p9", name: "Calming Herbal Tea", price: 3200, image: p5, category: "wellness", description: "Chamomile, lemongrass and lavender. 20 sachets." },
];
