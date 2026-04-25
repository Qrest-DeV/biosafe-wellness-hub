import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import hero1 from "@/assets/hero-pharmacist.jpg";
import hero2 from "@/assets/hero-skincare.jpg";
import hero3 from "@/assets/hero-wellness.jpg";

const slides = [
  {
    image: hero1,
    eyebrow: "Pharmacy · 24/7",
    title: "More than prescriptions. Complete wellness.",
    body: "Order medicines, talk to a pharmacist, and get same-day delivery across Lagos.",
    cta: { label: "Shop pharmacy", to: "/shop?cat=drugs" },
    tone: "peach",
  },
  {
    image: hero2,
    eyebrow: "Skincare for melanin-rich skin",
    title: "A daily ritual, dermatologist-approved.",
    body: "Curated routines with sunscreens, serums and creams formulated for you.",
    cta: { label: "Shop skincare", to: "/shop?cat=skincare" },
    tone: "mint",
  },
  {
    image: hero3,
    eyebrow: "BioLife Family",
    title: "Healthcare and lifestyle, beautifully bundled.",
    body: "Free delivery, juices, consultations and aesthetics — all in one subscription.",
    cta: { label: "See plans", to: "/subscriptions" },
    tone: "teal",
  },
];

export const HeroCarousel = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-base">
      <div className="container-x pt-6 md:pt-10 pb-14 md:pb-20">
        <div className="relative rounded-[2rem] overflow-hidden min-h-[520px] md:min-h-[600px]">
          {slides.map((s, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              } ${s.tone === "peach" ? "bg-peach" : s.tone === "mint" ? "bg-mint" : "bg-teal"}`}
            >
              <div className="grid md:grid-cols-2 h-full min-h-[520px] md:min-h-[600px]">
                <div className={`flex flex-col justify-center p-8 md:p-14 ${s.tone === "teal" ? "text-peach" : "text-teal"}`}>
                  <span className="pill bg-background/60 text-teal w-fit">{s.eyebrow}</span>
                  <h1 className={`mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-xl ${s.tone === "teal" ? "text-peach" : "text-teal"}`}>
                    {s.title}
                  </h1>
                  <p className={`mt-5 max-w-md text-base md:text-lg ${s.tone === "teal" ? "text-peach/80" : "text-teal/75"}`}>
                    {s.body}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      to={s.cta.to}
                      className="inline-flex items-center gap-2 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground px-7 py-3.5 font-medium shadow-warm transition"
                    >
                      {s.cta.label} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/services"
                      className={`inline-flex items-center gap-2 rounded-full border px-7 py-3.5 font-medium transition ${
                        s.tone === "teal"
                          ? "border-peach/40 text-peach hover:bg-peach hover:text-teal"
                          : "border-teal/30 text-teal hover:bg-teal hover:text-peach"
                      }`}
                    >
                      Talk to a Pro
                    </Link>
                  </div>
                </div>
                <div className="relative hidden md:block">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-5 left-8 md:left-14 z-10 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-10 bg-terracotta" : "w-5 bg-foreground/20"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
