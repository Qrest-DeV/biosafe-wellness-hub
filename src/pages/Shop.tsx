import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/catalog";
import { useProducts, dbToProduct } from "@/hooks/useProducts";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "all";
  const [q, setQ] = useState("");
  const { products } = useProducts();

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
      ),
    [cat, q, products]
  );

  return (
    <Layout>
      <section className="bg-peach">
        <div className="container-x py-14 md:py-20">
          <span className="pill bg-background text-teal mb-4">Shop</span>
          <h1 className="text-4xl md:text-5xl max-w-2xl">A pharmacy that feels like wellness.</h1>
          <p className="mt-4 text-teal/70 max-w-lg">Browse drugs, supplements, skincare and lifestyle goods — delivered same-day.</p>

          <div className="mt-8 card-soft flex items-center gap-3 px-5 py-3 max-w-2xl">
            <Search className="h-5 w-5 text-teal/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent outline-none text-sm md:text-base"
            />
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[{ slug: "all", name: "All" }, ...categories].map((c) => (
            <button
              key={c.slug}
              onClick={() => setParams(c.slug === "all" ? {} : { cat: c.slug })}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                cat === c.slug
                  ? "bg-teal text-peach"
                  : "bg-card text-teal hover:bg-peach"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={dbToProduct(p)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No products match your search.</p>
        )}
      </section>
    </Layout>
  );
};

export default Shop;
