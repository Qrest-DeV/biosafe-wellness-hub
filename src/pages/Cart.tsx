import { Layout } from "@/components/Layout";
import { useCart, formatNaira } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const delivery = items.length ? 1500 : 0;
  const total = subtotal + delivery;

  const checkout = () => {
    toast.success("Order placed! We'll deliver same-day across Lagos.");
    clear();
  };

  if (items.length === 0) {
    return (
      <Layout>
        <section className="container-x py-24 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-peach flex items-center justify-center text-terracotta mb-6">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl">Your cart is empty.</h1>
          <p className="mt-3 text-muted-foreground">Let's find something to take care of you.</p>
          <Link to="/shop" className="inline-block mt-8 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground px-7 py-3.5 font-medium">
            Browse the shop
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-x py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl mb-10">Cart</h1>
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-4">
            {items.map((i) => (
              <div key={i.id} className="card-soft p-4 flex gap-4 items-center">
                <img src={i.image} alt={i.name} className="h-24 w-24 rounded-2xl object-cover bg-peach" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.category}</div>
                  <div className="font-semibold text-teal truncate">{i.name}</div>
                  <div className="text-terracotta font-semibold mt-1">{formatNaira(i.price)}</div>
                </div>
                <div className="flex items-center gap-2 bg-base rounded-full px-1 py-1">
                  <button onClick={() => setQty(i.id, i.qty - 1)} className="h-8 w-8 rounded-full hover:bg-card flex items-center justify-center" aria-label="Decrease">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} className="h-8 w-8 rounded-full hover:bg-card flex items-center justify-center" aria-label="Increase">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button onClick={() => remove(i.id)} className="h-9 w-9 rounded-full hover:bg-peach text-muted-foreground hover:text-terracotta flex items-center justify-center" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <aside className="card-soft p-7 h-fit">
            <h2 className="text-xl font-semibold text-teal">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatNaira(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Same-day delivery</span><span className="font-medium">{formatNaira(delivery)}</span></div>
              <div className="border-t border-border pt-3 flex justify-between text-base"><span className="font-semibold text-teal">Total</span><span className="font-semibold text-teal">{formatNaira(total)}</span></div>
            </div>
            <button onClick={checkout} className="mt-6 w-full rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground py-3.5 font-medium shadow-warm transition">
              Checkout
            </button>
            <Link to="/shop" className="mt-3 block text-center text-sm text-teal hover:text-terracotta">Continue shopping</Link>
            <div className="mt-6 rounded-2xl bg-mint text-teal p-4 text-xs">
              💡 Save up to 20% by adding this order to a <Link to="/subscriptions" className="underline font-medium">BioLife subscription</Link>.
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
