import { Link } from "react-router-dom";

// Har inner page ka luxury header (dark navy + gold glow + floating orbs)
export default function PageHero({
  eyebrow,
  title,
  accent,
  text,
  crumb,
  children,
}) {
  return (
    <section className="grain relative overflow-hidden bg-royal">
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] animate-glow rounded-full bg-champ-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-[360px] w-[360px] animate-glow rounded-full bg-gold-500/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] top-1/2 hidden h-40 w-40 animate-floaty rounded-full border border-champ-300/30 md:block" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute right-[18%] top-[30%] hidden h-16 w-16 animate-floaty rounded-full border border-champ-300/20 [animation-delay:1.5s] md:block" />
      <div className="container-x relative py-16 sm:py-24">
        <div className="animate-fadeUp">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-champ-300">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-champ-100">{crumb || title}</span>
          </nav>
          {eyebrow && (
            <span className="eyebrow !text-champ-300">{eyebrow}</span>
          )}
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[1.02] text-white sm:text-7xl">
            {title} {accent && <span className="gold-text">{accent}</span>}
          </h1>
          {text && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-champ-100/80">
              {text}
            </p>
          )}
          {children}
        </div>
      </div>
      <div className="hairline absolute inset-x-0 bottom-0" />
    </section>
  );
}
