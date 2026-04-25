import { Link } from "react-router-dom";
import { Product, useCart, formatNaira } from "@/context/CartContext";
import { Plus } from "lucide-react";

export const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  return (
    <div className="group card-soft overflow-hidden flex flex-col">
      <Link to={`/shop?cat=${product.category}`} className="relative aspect-square bg-peach overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition duration-700"
        />
        {product.badge && (
          <span className="pill absolute top-3 left-3 bg-teal text-peach">{product.badge}</span>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.category}</span>
        <h3 className="mt-1 text-base font-semibold text-teal leading-snug">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-teal">{formatNaira(product.price)}</span>
          <button
            onClick={() => add(product)}
            aria-label={`Add ${product.name} to cart`}
            className="h-10 w-10 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground flex items-center justify-center transition shadow-warm"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
