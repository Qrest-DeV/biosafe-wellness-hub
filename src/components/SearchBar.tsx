import { Search } from "lucide-react";

export const SearchBar = () => (
  <section className="container-x -mt-8 md:-mt-12 relative z-10">
    <form className="card-soft flex items-center gap-3 px-5 py-3 md:py-4 max-w-3xl mx-auto" onSubmit={(e) => e.preventDefault()}>
      <Search className="h-5 w-5 text-teal/60 shrink-0" />
      <input
        type="search"
        placeholder="Search medicines, skincare, supplements…"
        className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground"
      />
      <button className="rounded-full bg-teal hover:bg-teal-soft text-peach text-sm font-medium px-5 py-2.5 transition">
        Search
      </button>
    </form>
  </section>
);
