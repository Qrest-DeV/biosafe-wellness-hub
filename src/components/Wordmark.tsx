import { Link } from "react-router-dom";

export const Wordmark = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`inline-flex items-center gap-1 leading-none ${className}`} aria-label="BioLife24 home">
    <span className="italic font-serif" style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif", fontWeight: 800 }}>bio</span>
    <span className="font-bold" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}>life</span>
    <span className="ml-0.5 inline-flex items-center justify-center rounded-full border-2 border-current text-[0.55em] font-bold w-[1.6em] h-[1.6em] -translate-y-0.5">24</span>
  </Link>
);
