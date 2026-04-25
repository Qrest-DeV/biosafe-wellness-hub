import { Link } from "react-router-dom";
import { categories } from "@/data/catalog";

const tones: Record<string, string> = {
  drugs: "bg-peach text-teal",
  supplements: "bg-mint text-teal",
  skincare: "bg-base text-teal border border-border",
  wellness: "bg-teal text-peach",
};

export const Categories = () => (
  <section className="container-x py-16 md:py-24">
    <div className="flex items-end justify-between mb-10">
      <div>
        <span className="pill bg-mint text-teal mb-3">Shop by category</span>
        <h2 className="text-3xl md:text-4xl">Everything for a healthier you.</h2>
      </div>
      <Link to="/shop" className="hidden md:inline text-sm text-terracotta hover:underline">View all →</Link>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {categories.map((c) => (
        <Link
          key={c.slug}
          to={`/shop?cat=${c.slug}`}
          className={`group rounded-3xl p-7 md:p-9 aspect-[4/5] flex flex-col justify-between transition hover:-translate-y-1 ${tones[c.slug]}`}
        >
          <span className="text-4xl md:text-5xl font-light opacity-80">{c.emoji}</span>
          <div>
            <h3 className={`text-xl md:text-2xl font-semibold ${c.slug === "wellness" ? "text-peach" : "text-teal"}`}>{c.name}</h3>
            <p className={`text-xs md:text-sm mt-1 opacity-75`}>{c.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);
