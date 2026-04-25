import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
  benefits?: string[];
  howItWorks?: string;
  usage?: string;
};

type CartItem = Product & { qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("biolife_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("biolife_cart", JSON.stringify(items));
  }, [items]);

  const add = (p: Product) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === p.id);
      if (found) return cur.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...cur, { ...p, qty: 1 }];
    });
    toast.success(`${p.name} added to cart`);
  };
  const remove = (id: string) => setItems((c) => c.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, subtotal }}>
      {children}
    </Ctx.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
