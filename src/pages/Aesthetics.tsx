import { Layout } from "@/components/Layout";
import aesthetics from "@/assets/aesthetics-hero.jpg";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Droplet, Sun, Heart } from "lucide-react";

const treatments = [
  { icon: Droplet, name: "Hydrating Facial", desc: "Deeply replenishes and calms tired skin in 60 minutes.", price: "₦25,000" },
  { icon: Sun, name: "Brightening Peel", desc: "Even tone and smooth texture with a gentle, derm-led peel.", price: "₦35,000" },
  { icon: Sparkles, name: "Glow Boost Treatment", desc: "Microneedling + serum infusion for radiant, plump skin.", price: "₦55,000" },
  { icon: Heart, name: "Wellness Consultation", desc: "1-on-1 lifestyle audit with a wellness practitioner.", price: "₦15,000" },
];

const Aesthetics = () => (
  <Layout>
    <section className="container-x pt-10 md:pt-14">
      <div className="rounded-[2rem] overflow-hidden grid md:grid-cols-2 bg-peach min-h-[480px]">
        <div className="p-8 md:p-14 flex flex-col justify-center">
          <span className="pill bg-background text-teal w-fit mb-4">Aesthetics & Wellness</span>
          <h1 className="text-4xl md:text-6xl text-teal leading-[1.05]">Glow that comes from real care.</h1>
          <p className="mt-5 text-teal/75 max-w-md">
            BioLife24 Aesthetics is where dermatology meets ritual. Treatments designed
            for melanin-rich skin, by professionals who understand it.
          </p>
          <Link
            to="/services"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground px-7 py-3.5 font-medium w-fit shadow-warm transition"
          >
            Book a consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative min-h-[280px]">
          <img src={aesthetics} alt="Aesthetics treatments" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </section>

    <section className="container-x py-16 md:py-24">
      <div className="max-w-2xl mb-12">
        <span className="pill bg-mint text-teal mb-3">Treatments</span>
        <h2 className="text-3xl md:text-4xl">Curated treatments. Honest results.</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {treatments.map((t) => (
          <div key={t.name} className="card-soft p-7 flex items-start gap-5">
            <span className="h-14 w-14 rounded-2xl bg-mint text-teal flex items-center justify-center shrink-0">
              <t.icon className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-semibold text-teal">{t.name}</h3>
                <span className="text-terracotta font-semibold">{t.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="container-x pb-20">
      <div className="rounded-[2rem] gradient-teal text-peach p-10 md:p-16 text-center">
        <h2 className="text-3xl md:text-5xl text-peach max-w-2xl mx-auto">Ready to start your glow ritual?</h2>
        <p className="mt-4 text-peach/75 max-w-lg mx-auto">A 15-minute consultation is all it takes to map out your personalised treatment plan.</p>
        <Link
          to="/services"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground px-8 py-3.5 font-medium shadow-warm transition"
        >
          Book consultation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </Layout>
);

export default Aesthetics;
