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
  {
    id: "p1", name: "Paracetamol 500mg", price: 1200, image: p1, category: "drugs",
    description: "Fast-acting relief for fever and mild pain. 24 tablets per pack.", badge: "Bestseller",
    benefits: [
      "Reduces fever within 30 minutes",
      "Eases headaches, body aches and menstrual pain",
      "Gentle on the stomach when taken as directed",
      "Non-drowsy — safe for daytime use",
    ],
    howItWorks: "Paracetamol blocks pain signals in the brain and lowers the body's temperature set-point in the hypothalamus, easing fever and mild-to-moderate pain without irritating the stomach lining.",
    usage: "Adults: 1–2 tablets every 4–6 hours as needed. Do not exceed 8 tablets in 24 hours.",
  },
  {
    id: "p2", name: "Vitamin C Brightening Serum", price: 8500, image: p2, category: "skincare",
    description: "10% Vitamin C serum that brightens, evens tone and fades marks.",
    benefits: [
      "Visibly brightens dull skin in 2–4 weeks",
      "Fades dark spots and post-acne marks",
      "Boosts collagen for firmer-looking skin",
      "Shields against daily pollution and UV stress",
    ],
    howItWorks: "Stabilised L-Ascorbic Acid neutralises free radicals on the skin's surface and signals fibroblasts to produce more collagen, while inhibiting tyrosinase to slow excess melanin production.",
    usage: "Apply 3–4 drops to clean skin every morning before moisturiser and SPF.",
  },
  {
    id: "p3", name: "Hydra Repair Moisturiser", price: 6900, image: p3, category: "skincare",
    description: "Lightweight ceramide cream for daily hydration and barrier repair.",
    benefits: [
      "Locks in moisture for up to 24 hours",
      "Restores a compromised skin barrier",
      "Calms redness and tightness",
      "Non-comedogenic — won't clog pores",
    ],
    howItWorks: "A blend of ceramides, hyaluronic acid and niacinamide replenishes the skin's natural lipid layer, drawing water into the deeper layers and sealing it in to prevent trans-epidermal water loss.",
    usage: "Massage a pearl-sized amount onto damp skin morning and night.",
  },
  {
    id: "p4", name: "Daily Multivitamin", price: 5400, image: p4, category: "supplements",
    description: "Complete A–Z multivitamin with iron and zinc, 60 capsules.", badge: "New",
    benefits: [
      "Fills daily nutritional gaps",
      "Supports energy, focus and immunity",
      "Iron helps reduce tiredness and fatigue",
      "Zinc supports healthy skin, hair and nails",
    ],
    howItWorks: "A balanced dose of 23 essential vitamins and minerals is absorbed in the small intestine, where they act as cofactors in hundreds of metabolic reactions — from energy production to immune defence.",
    usage: "Take 1 capsule daily with food and water.",
  },
  {
    id: "p5", name: "Cold-Pressed Green Juice", price: 2500, image: p5, category: "wellness",
    description: "Cucumber, apple, ginger and spinach. Daily glow in a bottle.",
    benefits: [
      "Hydrates and replenishes electrolytes",
      "Rich in chlorophyll and antioxidants",
      "Supports digestion and gut comfort",
      "Naturally energising — no added sugar",
    ],
    howItWorks: "Cold-pressing extracts juice without heat or oxidation, preserving live enzymes and water-soluble vitamins (C, B-complex) that support cellular hydration and detoxification pathways in the liver.",
    usage: "Drink one bottle in the morning on an empty stomach. Keep refrigerated.",
  },
  {
    id: "p6", name: "Mineral Sunscreen SPF 50", price: 9800, image: p6, category: "skincare",
    description: "Lightweight, non-greasy SPF 50 — safe for melanin-rich skin.", badge: "Loved",
    benefits: [
      "Broad-spectrum UVA + UVB protection",
      "No white cast on deeper skin tones",
      "Prevents dark spots and premature ageing",
      "Reef-safe and suitable for sensitive skin",
    ],
    howItWorks: "Micronised zinc oxide sits on the skin's surface and physically reflects UV rays before they penetrate, while antioxidants neutralise any free radicals that do break through.",
    usage: "Apply generously as the last step of your morning routine. Reapply every 2 hours outdoors.",
  },
  {
    id: "p7", name: "Ibuprofen 400mg", price: 1500, image: p1, category: "drugs",
    description: "Anti-inflammatory pain relief. 20 tablets.",
    benefits: [
      "Targets pain at the source — inflammation",
      "Effective for muscle, joint and dental pain",
      "Reduces swelling and stiffness",
      "Lowers fever quickly",
    ],
    howItWorks: "Ibuprofen inhibits COX-1 and COX-2 enzymes, blocking the production of prostaglandins — the chemicals responsible for pain, inflammation and fever in the body.",
    usage: "Adults: 1 tablet every 6–8 hours with food. Do not exceed 3 tablets in 24 hours.",
  },
  {
    id: "p8", name: "Omega-3 Fish Oil", price: 7200, image: p4, category: "supplements",
    description: "1000mg high-purity omega-3 for heart and brain support.",
    benefits: [
      "Supports healthy heart and circulation",
      "Boosts brain function and mood",
      "Reduces joint stiffness",
      "Molecularly distilled — no fishy aftertaste",
    ],
    howItWorks: "EPA and DHA fatty acids integrate into cell membranes throughout the body, improving membrane fluidity and producing anti-inflammatory signalling molecules called resolvins and protectins.",
    usage: "Take 1 softgel daily with a meal containing fat for best absorption.",
  },
  {
    id: "p9", name: "Calming Herbal Tea", price: 3200, image: p5, category: "wellness",
    description: "Chamomile, lemongrass and lavender. 20 sachets.",
    benefits: [
      "Promotes deep, restful sleep",
      "Eases everyday stress and tension",
      "Soothes digestion after meals",
      "Caffeine-free — drink any time",
    ],
    howItWorks: "Apigenin from chamomile binds to GABA receptors in the brain, gently calming the nervous system, while linalool from lavender lowers cortisol to help the body wind down naturally.",
    usage: "Steep one sachet in hot water for 5 minutes. Best enjoyed 30 minutes before bed.",
  },
];
