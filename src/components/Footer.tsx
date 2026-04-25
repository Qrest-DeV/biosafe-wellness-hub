import { Wordmark } from "./Wordmark";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";

export const Footer = () => (
  <footer className="bg-teal text-peach mt-24">
    <div className="container-x py-16 grid md:grid-cols-4 gap-10">
      <div>
        <Wordmark className="text-peach text-3xl" />
        <p className="mt-5 text-sm text-peach/70 max-w-xs">
          More than prescriptions. Your wellbeing, around the clock.
        </p>
        <div className="flex gap-3 mt-6">
          {[Instagram, Twitter, Facebook].map((Icon, i) => (
            <a key={i} href="#" className="h-9 w-9 rounded-full border border-peach/30 hover:bg-terracotta hover:border-terracotta flex items-center justify-center transition">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      {[
        { title: "Shop", links: [["Drugs", "/shop?cat=drugs"], ["Supplements", "/shop?cat=supplements"], ["Skincare", "/shop?cat=skincare"], ["Wellness", "/shop?cat=wellness"]] },
        { title: "Care", links: [["Subscriptions", "/subscriptions"], ["Talk to a Pharmacist", "/services"], ["Talk to a Doctor", "/services"], ["Aesthetics", "/aesthetics"]] },
        { title: "Company", links: [["About", "#"], ["Contact", "#"], ["FAQ", "#"], ["Privacy", "#"]] },
      ].map((col) => (
        <div key={col.title}>
          <h4 className="text-peach text-sm font-semibold uppercase tracking-widest mb-4">{col.title}</h4>
          <ul className="space-y-3">
            {col.links.map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="text-sm text-peach/70 hover:text-terracotta transition">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-peach/15">
      <div className="container-x py-6 text-xs text-peach/50 flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} BioLife24. Lagos, Nigeria.</span>
        <span>Pharmacy · Wellness · Lifestyle</span>
      </div>
    </div>
  </footer>
);
