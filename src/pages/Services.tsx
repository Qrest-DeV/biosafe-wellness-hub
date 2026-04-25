import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Send, Phone } from "lucide-react";
import pharm from "@/assets/pro-pharmacist.jpg";
import doc from "@/assets/pro-doctor.jpg";
import derma from "@/assets/pro-derma.jpg";

const pros = [
  { id: "pharm", name: "Amarachi K.", role: "Lead Pharmacist", img: pharm, intro: "Hi, I can help with medications, refills and side effects. How can I support you today?" },
  { id: "doc", name: "Dr. Tunde A.", role: "General Practitioner", img: doc, intro: "Hello — share your symptoms and I'll guide you to the right next step." },
  { id: "derma", name: "Dr. Chiamaka O.", role: "Dermatologist", img: derma, intro: "Tell me about your skin concerns, current routine and any reactions." },
];

type Msg = { from: "me" | "pro"; text: string };

const Services = () => {
  const [active, setActive] = useState(pros[0]);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({
    pharm: [{ from: "pro", text: pros[0].intro }],
    doc: [{ from: "pro", text: pros[1].intro }],
    derma: [{ from: "pro", text: pros[2].intro }],
  });
  const [text, setText] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const userMsg: Msg = { from: "me", text };
    setMsgs((m) => ({ ...m, [active.id]: [...m[active.id], userMsg] }));
    setText("");
    setTimeout(() => {
      setMsgs((m) => ({
        ...m,
        [active.id]: [
          ...m[active.id],
          { from: "pro", text: "Thanks for sharing — a teammate will follow up shortly. For urgent issues, please tap the WhatsApp button." },
        ],
      }));
    }, 800);
  };

  const current = msgs[active.id];

  return (
    <Layout>
      <section className="bg-base">
        <div className="container-x py-12 md:py-16">
          <span className="pill bg-mint text-teal mb-4">Talk to a Pro</span>
          <h1 className="text-4xl md:text-5xl max-w-2xl">Real care, in real time.</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">Chat with a licensed BioLife24 professional, or message us on WhatsApp.</p>
        </div>
      </section>

      <section className="container-x py-10 grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="space-y-3">
          {pros.map((p) => {
            const isActive = active.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className={`w-full text-left rounded-3xl p-4 flex items-center gap-4 transition ${
                  isActive ? "bg-teal text-peach" : "bg-card hover:bg-peach"
                }`}
              >
                <img src={p.img} alt={p.name} className="h-14 w-14 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className={`font-semibold ${isActive ? "text-peach" : "text-teal"}`}>{p.name}</div>
                  <div className={`text-xs ${isActive ? "text-peach/70" : "text-muted-foreground"}`}>{p.role}</div>
                </div>
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-mint" />
              </button>
            );
          })}
          <a
            href="https://wa.me/2348000000000"
            className="w-full text-left rounded-3xl p-4 flex items-center gap-4 bg-mint hover:bg-mint/80 transition"
          >
            <span className="h-14 w-14 rounded-full bg-teal text-peach flex items-center justify-center">
              <Phone className="h-6 w-6" />
            </span>
            <div>
              <div className="font-semibold text-teal">WhatsApp us</div>
              <div className="text-xs text-teal/70">Reply within minutes</div>
            </div>
          </a>
        </aside>

        <div className="card-soft flex flex-col h-[600px]">
          <div className="p-5 border-b border-border flex items-center gap-4">
            <img src={active.img} alt={active.name} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <div className="font-semibold text-teal">{active.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> online · typically replies instantly
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-base/40">
            {current.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === "me"
                      ? "bg-terracotta text-primary-foreground rounded-br-md"
                      : "bg-card text-foreground rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="p-4 border-t border-border flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-full bg-base px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-terracotta/30"
            />
            <button className="h-11 w-11 rounded-full bg-teal text-peach flex items-center justify-center hover:bg-teal-soft transition" aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
