import { Layout } from "@/components/Layout";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const plans = [
  {
    name: "BioLife Essentials",
    price: "₦9,500",
    cadence: "/ month",
    blurb: "All the basics covered, beautifully simple.",
    features: ["Free delivery", "Free pharmacist consultation", "Auto-refills", "Medication reminders", "24/7 chat"],
    tone: "card",
    cta: "Start Essentials",
  },
  {
    name: "BioLife Family",
    price: "₦24,000",
    cadence: "/ month",
    blurb: "For households who care for everyone, every day.",
    features: [
      "Everything in Essentials",
      "Free delivery for the whole family",
      "Free doctor consultation",
      "Free aesthetics session",
      "Free juice a day",
      "Quarterly medication review",
      "Lifestyle & meal plans",
    ],
    tone: "teal",
    cta: "Start Family",
    featured: true,
  },
];

const perks = [
  "Auto-refills",
  "Medication reminders",
  "24/7 pharmacy chat",
  "Same-day delivery",
  "Healthy meal recommendations",
  "Lifestyle & exercise recommendations",
  "Quarterly medication review",
];

const Subscriptions = () => (
  <Layout>
    <section className="bg-mint">
      <div className="container-x py-16 md:py-24 text-center max-w-3xl mx-auto">
        <span className="pill bg-background text-teal mb-4 mx-auto">Subscriptions</span>
        <h1 className="text-4xl md:text-6xl">Healthcare you don't have to think about.</h1>
        <p className="mt-5 text-teal/75">Choose a plan that fits your life — we'll handle the prescriptions, deliveries, and check-ins.</p>
      </div>
    </section>

    <section className="container-x py-16 md:py-20 grid md:grid-cols-2 gap-6 md:gap-8 -mt-10 md:-mt-14 relative z-10">
      {plans.map((p) => (
        <div
          key={p.name}
          className={`rounded-[2rem] p-8 md:p-10 relative ${
            p.tone === "teal" ? "gradient-teal text-peach shadow-warm" : "bg-card shadow-card"
          }`}
        >
          {p.featured && (
            <span className="pill absolute top-6 right-6 bg-terracotta text-primary-foreground">
              <Sparkles className="h-3 w-3" /> Most loved
            </span>
          )}
          <h2 className={`text-2xl md:text-3xl ${p.tone === "teal" ? "text-peach" : "text-teal"}`}>{p.name}</h2>
          <p className={`mt-2 text-sm ${p.tone === "teal" ? "text-peach/70" : "text-muted-foreground"}`}>{p.blurb}</p>
          <div className="mt-6 flex items-baseline gap-2">
            <span className={`text-5xl font-semibold ${p.tone === "teal" ? "text-peach" : "text-teal"}`}>{p.price}</span>
            <span className={`text-sm ${p.tone === "teal" ? "text-peach/60" : "text-muted-foreground"}`}>{p.cadence}</span>
          </div>
          <ul className="mt-8 space-y-3">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                  p.tone === "teal" ? "bg-terracotta/30 text-terracotta" : "bg-mint text-teal"
                }`}>
                  <Check className="h-3 w-3" />
                </span>
                <span className={p.tone === "teal" ? "text-peach/90" : "text-foreground"}>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => toast.success(`${p.name} selected — checkout coming soon!`)}
            className={`mt-10 w-full rounded-full py-3.5 font-medium transition ${
              p.tone === "teal"
                ? "bg-terracotta hover:bg-terracotta-deep text-primary-foreground"
                : "bg-teal hover:bg-teal-soft text-peach"
            }`}
          >
            {p.cta}
          </button>
        </div>
      ))}
    </section>

    <section className="container-x pb-20">
      <div className="rounded-[2rem] bg-peach p-8 md:p-14">
        <h3 className="text-2xl md:text-3xl text-teal max-w-md">Every plan includes the things that matter.</h3>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3 bg-background rounded-2xl px-5 py-4">
              <span className="h-7 w-7 rounded-full bg-mint text-teal flex items-center justify-center">
                <Check className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-teal">{perk}</span>
            </div>
          ))}
        </div>
        <Link to="/services" className="inline-block mt-8 text-terracotta font-medium hover:underline">
          Need help choosing? Talk to a pharmacist →
        </Link>
      </div>
    </section>
  </Layout>
);

export default Subscriptions;
