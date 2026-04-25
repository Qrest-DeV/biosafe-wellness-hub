import { Link } from "react-router-dom";
import aesthetics from "@/assets/aesthetics-hero.jpg";
import { ArrowRight } from "lucide-react";

export const AestheticsPreview = () => (
  <section className="container-x py-16 md:py-24">
    <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-stretch">
      <div className="rounded-[2rem] overflow-hidden order-2 md:order-1 min-h-[360px]">
        <img src={aesthetics} alt="Aesthetics treatments" loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="rounded-[2rem] bg-peach p-8 md:p-12 flex flex-col justify-center order-1 md:order-2">
        <span className="pill bg-background text-teal w-fit mb-4">Aesthetics</span>
        <h2 className="text-3xl md:text-5xl text-teal leading-tight max-w-md">
          Skincare and wellness, gently elevated.
        </h2>
        <p className="mt-5 text-teal/75 max-w-md">
          Facials, peels, hydrating treatments and consultations led by certified
          professionals — designed for melanin-rich skin and Nigerian climates.
        </p>
        <Link
          to="/aesthetics"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal hover:bg-teal-soft text-peach px-7 py-3.5 font-medium w-fit transition"
        >
          Book a consultation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);
