import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import pharm from "@/assets/pro-pharmacist.jpg";
import doc from "@/assets/pro-doctor.jpg";
import derma from "@/assets/pro-derma.jpg";

const pros = [
  { name: "Talk to a Pharmacist", role: "Medication advice, refills, side effects.", img: pharm, tone: "bg-peach" },
  { name: "Talk to a Doctor", role: "General health concerns, diagnoses, referrals.", img: doc, tone: "bg-mint" },
  { name: "Talk to a Dermatologist", role: "Skin, hair and routine consultations.", img: derma, tone: "bg-teal" },
];

export const TalkToPro = () => (
  <section className="container-x py-16 md:py-24">
    <div className="flex items-end justify-between mb-10">
      <div>
        <span className="pill bg-mint text-teal mb-3">Care, on demand</span>
        <h2 className="text-3xl md:text-4xl">Talk to a professional.</h2>
        <p className="mt-3 text-muted-foreground max-w-md">Real humans, available around the clock — by chat or WhatsApp.</p>
      </div>
    </div>
    <div className="grid md:grid-cols-3 gap-5">
      {pros.map((p) => (
        <Link to="/services" key={p.name} className={`group rounded-3xl overflow-hidden ${p.tone} flex flex-col`}>
          <div className="aspect-[4/3] overflow-hidden">
            <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${p.tone === "bg-teal" ? "text-peach" : "text-teal"}`}>{p.name}</h3>
              <p className={`text-sm mt-1 ${p.tone === "bg-teal" ? "text-peach/70" : "text-teal/70"}`}>{p.role}</p>
            </div>
            <span className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${p.tone === "bg-teal" ? "bg-peach text-teal" : "bg-teal text-peach"}`}>
              <MessageCircle className="h-5 w-5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
);
