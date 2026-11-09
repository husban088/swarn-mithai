import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ShieldCheck, ShoppingBag, User } from "lucide-react";
import Logo from "./Logo";
import SideMenu from "./SideMenu";
import CountrySwitch from "./CountrySwitch";
import { CATEGORIES, SHOP_INFO, brandFor } from "../config";
import { useAuth, useGeo, useShop } from "../store";

export default function Navbar() {
  const { country } = useGeo();
  const { user } = useAuth();
  const { count, setDrawer } = useShop();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const loc = useLocation();
  const brand = brandFor(country.code);

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname, loc.search]);

  // Neeche scroll = top header + navbar chhup jaye, upar scroll = wapis aa jaye
  useEffect(() => {
    lastY.current = window.scrollY;
    let raf = 0;
    const run = () => {
      raf = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY.current;
      setScrolled(y > 12);
      if (y <= 24) setHidden(false);
      else if (delta > 6) setHidden(true);
      else if (delta < -6) setHidden(false);
      if (Math.abs(delta) > 6 || y <= 24) lastY.current = y;
    };
    // requestAnimationFrame: scroll par har frame me sirf ek baar chale
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  // Page badalne par navbar wapis dikhao
  useEffect(() => {
    setHidden(false);
  }, [loc.pathname]);

  const cur = new URLSearchParams(loc.search).get("cat");
  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/shop", label: "Shop", shop: true },
    { to: "/about", label: "About" },
    ...(country.categories.includes("sweets")
      ? [{ to: "/events", label: "Events" }]
      : []),
    { to: "/services", label: "Services" },
    { to: "/why-us", label: "Why Us" },
    { to: "/contact", label: "Contact" },
  ];
  const isActive = (l) =>
    l.shop
      ? loc.pathname === "/shop"
      : l.end
        ? loc.pathname === l.to
        : loc.pathname.startsWith(l.to);

  const linkCls = (a) =>
    `group relative px-1 py-2 text-[13px] font-semibold uppercase tracking-[0.14em] transition duration-300 ${a ? "text-gold-500" : "text-slate-700 hover:text-gold-500"}`;
  const Underline = ({ a }) => (
    <span
      className={`absolute inset-x-0 -bottom-0.5 h-[2px] origin-left rounded bg-gradient-to-r from-gold-500 to-champ-300 transition-transform duration-500 ${a ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
    />
  );

  const topText = country.categories.includes("sweets")
    ? country.code === "PK"
      ? country.bar
      : `${SHOP_INFO.delivery.title} · Special event boxes · Special Box $${SHOP_INFO.special.box.price}`
    : `Cash on delivery across Pakistan · ${brand.name} pure drinking water`;

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] will-change-transform ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      {/* Top header strip */}
      <div className="bg-gradient-to-r from-[#0a3a78] via-[#1d7fe0] to-[#0a3a78] text-center text-[11px] font-medium tracking-wide text-white">
        <div className="container-x flex items-center justify-center gap-2 py-2">
          <span className="text-base leading-none">{country.flag}</span>
          <span className="truncate">{topText}</span>
          <span className="hidden text-white/70 sm:inline">
            · {country.phone}
            {country.phone2 ? ` / ${country.phone2}` : ""}
          </span>
        </div>
      </div>

      {/* Main navbar (white) */}
      <div
        className={`border-b border-slate-200/80 bg-white transition-all duration-500 ${scrolled ? "shadow-lg shadow-slate-900/10" : "shadow-sm shadow-slate-900/5"}`}
      >
        <div
          className={`container-x flex items-center justify-between gap-4 transition-all duration-500 ${scrolled ? (brand.key === "evelynone" ? "h-16 sm:h-[4.5rem]" : "h-20") : brand.key === "evelynone" ? "h-[4.5rem] sm:h-20" : "h-24"}`}
        >
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((l) =>
              l.shop ? (
                <div key={l.label} className="group/menu relative">
                  <NavLink to={l.to} className={() => linkCls(isActive(l))}>
                    <span className="inline-flex items-center gap-1">
                      {l.label}
                      <ChevronDown
                        size={13}
                        className="transition duration-300 group-hover/menu:rotate-180"
                      />
                    </span>
                    <Underline a={isActive(l)} />
                  </NavLink>
                  <div className="invisible absolute left-1/2 top-full z-10 w-56 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition duration-300 group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
                      <Link
                        to="/shop"
                        className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-gold-50 hover:pl-5 hover:text-gold-500 ${loc.pathname === "/shop" && !cur ? "text-gold-500" : "text-slate-700"}`}
                      >
                        All products
                      </Link>
                      {country.categories.map((c) => (
                        <Link
                          key={c}
                          to={`/shop?cat=${c}`}
                          className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-gold-50 hover:pl-5 hover:text-gold-500 ${cur === c ? "text-gold-500" : "text-slate-700"}`}
                        >
                          {CATEGORIES[c].icon} {CATEGORIES[c].label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={l.label}
                  to={l.to}
                  className={() => linkCls(isActive(l))}
                >
                  {l.label}
                  <Underline a={isActive(l)} />
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <CountrySwitch />

            <button
              onClick={() => setDrawer(true)}
              aria-label="Open cart"
              className="group relative hidden h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-500 hover:shadow-lg hover:shadow-gold-400/30 lg:grid"
            >
              <ShoppingBag
                size={20}
                className="transition duration-300 group-hover:scale-110"
              />
              {count > 0 && (
                <span
                  key={count}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-bump place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-white shadow"
                >
                  {count}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden items-center gap-2 lg:flex">
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    aria-label="Admin panel"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-500"
                  >
                    <ShieldCheck size={16} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  aria-label="My profile"
                  title="My profile"
                  className={`group relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#060607] via-[#0a3a78] to-[#1d7fe0] text-white shadow-lg shadow-royal/30 ring-2 transition duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-gold-500/40 active:scale-95 ${loc.pathname === "/profile" ? "ring-gold-300" : "ring-transparent hover:ring-gold-200"}`}
                >
                  <User
                    size={19}
                    className="transition duration-300 group-hover:scale-110"
                  />
                  <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <Link
                  to="/login"
                  className="link-draw px-1 text-sm font-semibold text-slate-700 transition hover:text-gold-500"
                >
                  Sign in
                </Link>
                <Link to="/signup" className="btn-gold !px-5 !py-2.5">
                  Create account
                </Link>
              </div>
            )}

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="group relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-700 transition duration-500 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-500 hover:shadow-lg hover:shadow-gold-400/30 lg:hidden"
            >
              {count > 0 && (
                <span
                  key={count}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-bump place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-white shadow"
                >
                  {count}
                </span>
              )}
              <span className="flex w-[18px] flex-col items-end gap-[5px]">
                <span className="h-[2px] w-full rounded bg-current transition-all duration-500 group-hover:w-[12px]" />
                <span className="h-[2px] w-[12px] rounded bg-current transition-all duration-500 group-hover:w-full" />
                <span className="h-[2px] w-full rounded bg-current transition-all duration-500 group-hover:w-[8px]" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <SideMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
