import { Link } from "react-router-dom";
import { categories } from "@/data/catalog";
import drugsImg from "@/assets/cat-drugs.jpg";
import supplementsImg from "@/assets/cat-supplements.jpg";
import skincareImg from "@/assets/cat-skincare.jpg";
import wellnessImg from "@/assets/cat-wellness.jpg";

const images: Record<string, string> = {
  drugs: drugsImg,
  supplements: supplementsImg,
  skincare: skincareImg,
  wellness: wellnessImg,
};

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
      {categories.map((c) => {
        const isDark = c.slug === "wellness";
        return (
          <Link
            key={c.slug}
            to={`/shop?cat=${c.slug}`}
            className={`group relative overflow-hidden rounded-3xl aspect-[4/5] flex flex-col justify-between transition hover:-translate-y-1 ${tones[c.slug]}`}
          >
            <img
              src={images[c.slug]}
              alt={c.name}
              loading="lazy"
              width={768}
              height={960}
              className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition duration-500"
            />
            <div
              className={`absolute inset-0 ${
                isDark
                  ? "bg-gradient-to-t from-teal/90 via-teal/40 to-transparent"
                  : "bg-gradient-to-t from-background/80 via-background/20 to-transparent"
              }`}
            />
            <div className="relative p-7 md:p-9 flex-1 flex flex-col justify-between">
              <span className="text-3xl md:text-4xl font-light opacity-90">{c.emoji}</span>
              <div>
                <h3 className={`text-xl md:text-2xl font-semibold ${isDark ? "text-peach" : "text-teal"}`}>{c.name}</h3>
                <p className={`text-xs md:text-sm mt-1 ${isDark ? "text-peach/80" : "text-teal/75"}`}>{c.desc}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
);
