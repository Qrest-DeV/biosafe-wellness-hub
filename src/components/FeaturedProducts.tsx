import { Link } from "react-router-dom";
import { products } from "@/data/catalog";
import { ProductCard } from "./ProductCard";

export const FeaturedProducts = () => (
  <section className="container-x py-16 md:py-24">
    <div className="flex items-end justify-between mb-10">
      <div>
        <span className="pill bg-peach text-teal mb-3">Featured</span>
        <h2 className="text-3xl md:text-4xl">Loved by our community.</h2>
      </div>
      <Link to="/shop" className="text-sm text-terracotta hover:underline">Shop all →</Link>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {products.slice(0, 4).map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  </section>
);
