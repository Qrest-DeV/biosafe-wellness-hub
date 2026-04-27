import { Link } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { useProducts, dbToProduct } from "@/hooks/useProducts";

export const FeaturedProducts = () => {
  const { products } = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const list = featured.length ? featured : products.slice(0, 4);

  return (
    <section className="container-x py-16 md:py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="pill bg-peach text-teal mb-3">Featured</span>
          <h2 className="text-3xl md:text-4xl">Loved by our community.</h2>
        </div>
        <Link to="/shop" className="text-sm text-terracotta hover:underline">Shop all →</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} product={dbToProduct(p)} />
        ))}
      </div>
    </section>
  );
};
