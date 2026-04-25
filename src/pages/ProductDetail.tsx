import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/data/catalog";
import { formatNaira, useCart } from "@/context/CartContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { ChevronLeft, Minus, Plus, ShieldCheck, Truck, RotateCcw, Check, Sparkles, Clock } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const product = useMemo(() => products.find((p) => p.id === id), [id]);

  const related = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter((p) => p.category === product.category && p.id !== product.id);
    const others = products.filter((p) => p.category !== product.category && p.id !== product.id);
    return [...sameCat, ...others].slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <Layout>
        <section className="container-x py-24 text-center">
          <h1 className="text-3xl mb-4">Product not found</h1>
          <Link to="/shop" className="text-terracotta hover:underline">← Back to shop</Link>
        </section>
      </Layout>
    );
  }

  const categoryName = categories.find((c) => c.slug === product.category)?.name ?? product.category;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) add(product);
  };

  return (
    <Layout>
      <section className="container-x py-8 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-teal/70 hover:text-teal mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 md:gap-14">
          <div className="card-soft overflow-hidden bg-peach aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <Link
              to={`/shop?cat=${product.category}`}
              className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-terracotta"
            >
              {categoryName}
            </Link>
            <h1 className="mt-2 text-3xl md:text-4xl text-teal">{product.name}</h1>
            {product.badge && (
              <span className="pill bg-mint text-teal mt-3 w-fit">{product.badge}</span>
            )}
            <p className="mt-5 text-base text-teal/75 leading-relaxed">{product.description}</p>

            <div className="mt-6 text-3xl font-semibold text-teal">{formatNaira(product.price)}</div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-teal/15 bg-card">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 flex items-center justify-center text-teal hover:bg-peach rounded-l-full"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium text-teal">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-11 w-11 flex items-center justify-center text-teal hover:bg-peach rounded-r-full"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 h-12 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground font-medium transition shadow-warm"
              >
                Add to cart · {formatNaira(product.price * qty)}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-teal/75">
              <div className="card-soft p-3 flex flex-col items-start gap-1.5">
                <Truck className="h-4 w-4 text-terracotta" />
                Same-day delivery
              </div>
              <div className="card-soft p-3 flex flex-col items-start gap-1.5">
                <ShieldCheck className="h-4 w-4 text-terracotta" />
                Verified & sealed
              </div>
              <div className="card-soft p-3 flex flex-col items-start gap-1.5">
                <RotateCcw className="h-4 w-4 text-terracotta" />
                Easy returns
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 md:mt-20 grid md:grid-cols-3 gap-5 md:gap-6">
          {product.benefits && product.benefits.length > 0 && (
            <div className="card-soft p-6 md:p-7 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-terracotta" />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Key benefits</span>
              </div>
              <h3 className="text-xl md:text-2xl text-teal mb-5">Why you'll love it</h3>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-teal/80 leading-relaxed">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-mint flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-teal" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.usage && (
            <div className="card-soft p-6 md:p-7 bg-peach/60">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-terracotta" />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">How to use</span>
              </div>
              <p className="text-sm text-teal/80 leading-relaxed">{product.usage}</p>
            </div>
          )}

          {product.howItWorks && (
            <div className="card-soft p-6 md:p-7 md:col-span-3 bg-gradient-to-br from-card to-peach/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="pill bg-teal text-peach">How it works</span>
              </div>
              <p className="text-base md:text-lg text-teal/85 leading-relaxed max-w-3xl">
                {product.howItWorks}
              </p>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="pill bg-peach text-teal mb-3">Pairs well with</span>
              <h2 className="text-2xl md:text-3xl">Complete your routine.</h2>
            </div>
            <Link to="/shop" className="text-sm text-terracotta hover:underline">Shop all →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
