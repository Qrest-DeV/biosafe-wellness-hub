import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import mark from "@/assets/biolife-mark.jpg";

const features = [
  "Auto-refills",
  "Medication reminders",
  "24/7 pharmacy chat",
  "Same-day delivery",
  "Healthy meal recommendations",
  "Lifestyle & exercise plans",
  "Quarterly medication review",
];

export const SubscriptionHighlight = () => (
  <section className="container-x py-16 md:py-24">
    <div className="rounded-[2rem] gradient-teal text-peach overflow-hidden relative p-8 md:p-16">
      <img src={mark} alt="" className="absolute -right-16 -bottom-16 w-[420px] opacity-15 mix-blend-screen pointer-events-none" />
      <div className="grid md:grid-cols-2 gap-12 relative">
        <div>
          <span className="pill bg-peach/20 text-peach mb-4">BioLife Subscriptions</span>
          <h2 className="text-3xl md:text-5xl text-peach max-w-md leading-tight">
            One plan. <em className="not-italic text-terracotta">Total</em> care.
          </h2>
          <p className="mt-5 max-w-md text-peach/75">
            Bundle your prescriptions, consultations and lifestyle perks. Built to make
            healthier living the default.
          </p>
          <Link
            to="/subscriptions"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta hover:bg-terracotta-deep text-primary-foreground px-7 py-3.5 font-medium shadow-warm transition"
          >
            Explore plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 self-center">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <span className="h-6 w-6 shrink-0 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-peach/90">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
