import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import Logo from "./Logo";
import CountrySwitch from "./CountrySwitch";
import { CATEGORIES, brandFor } from "../config";
import { useAuth, useGeo, useShop } from "../store";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop", shop: true },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events", sweets: true },
  { to: "/services", label: "Services" },
  { to: "/why-us", label: "Why Us" },
  { to: "/contact", label: "Contact" },
];

// Right-side luxury sidebar (cart drawer jaisa). Navbar ka menu button isay kholta hai.
export default function SideMenu({ open, onClose }) {
  const { country } = useGeo();
  const { user, signout } = useAuth();
  const { count, setDrawer } = useShop();
  const loc = useLocation();
  const brand = brandFor(country.code);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 320);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape se band + page scroll lock
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  const cur = new URLSearchParams(loc.search).get("cat");
  const isActive = (l) =>
    l.shop
      ? loc.pathname === "/shop"
      : l.end
        ? loc.pathname === l.to
        : loc.pathname.startsWith(l.to);
  const openCart = () => {
    onClose();
    setDrawer(true);
  };
  let row = 0;
  const delay = () => ({ animationDelay: `${120 + row++ * 55}ms` });

  return createPortal(
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm ${closing ? "animate-fadeOut" : "animate-pop"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-[min(100vw,440px)] flex-col overflow-hidden bg-white text-slate-800 shadow-2xl shadow-slate-900/30 ${closing ? "animate-slideOut" : "animate-slideIn"}`}
      >
        {/* Decor */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-glow rounded-full bg-champ-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 animate-glow rounded-full bg-champ-200/50 blur-3xl [animation-delay:2s]" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-64 w-64 rounded-full border border-gold-200/60" />
        <div className="pointer-events-none absolute -right-8 bottom-36 h-40 w-40 rounded-full border border-gold-200/60" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#1d7fe0 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pb-4 pt-5 sm:px-8 sm:pt-7">
          <div onClick={onClose}>
            <Logo />
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="group grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition duration-500 hover:rotate-90 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-500"
          >
            <X
              size={18}
              className="transition duration-500 group-hover:scale-110"
            />
          </button>
        </div>
        <div className="hairline relative mx-5 sm:mx-8" />

        {/* Scroll area */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8">
          {/* Country dropdown (sirf admin) */}
          <CountrySwitch className="animate-rowIn" />

          {/* Links */}
          <nav className="mt-5" aria-label="Main menu">
            {LINKS.filter((l) => !l.sweets || country.categories.includes("sweets")).map((l, i) => {
              const a = isActive(l);
              return (
                <div key={l.label} style={delay()} className="animate-rowIn">
                  <Link
                    to={l.to}
                    onClick={onClose}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-2xl px-3 py-3 transition duration-500 hover:bg-gold-50 hover:pl-5"
                  >
                    <span
                      className={`font-display text-sm font-semibold tabular-nums transition duration-500 ${a ? "text-gold-500" : "text-slate-300 group-hover:text-gold-500"}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-[2.1rem] font-semibold leading-none transition duration-500 sm:text-4xl ${a ? "text-gold-500" : "text-slate-800 group-hover:translate-x-1 group-hover:text-gold-500"}`}
                    >
                      {l.label}
                    </span>
                    {a && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 shadow-[0_0_12px_3px_rgba(29,127,224,.45)]" />
                    )}
                    <ArrowUpRight
                      size={20}
                      className="ml-auto -translate-x-3 text-gold-500 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                    <span className="absolute inset-y-3 left-0 w-[3px] origin-center scale-y-0 rounded-full champ-bg transition duration-500 group-hover:scale-y-100" />
                  </Link>
                  {l.shop && (
                    <div className="flex flex-wrap gap-2 pb-2 pl-14 pt-1">
                      {country.categories.map((c) => (
                        <Link
                          key={c}
                          to={`/shop?cat=${c}`}
                          onClick={onClose}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500 hover:text-white ${loc.pathname === "/shop" && cur === c ? "border-gold-500 bg-gold-50 text-gold-600" : "border-slate-200 text-slate-700"}`}
                        >
                          {CATEGORIES[c].icon} {CATEGORIES[c].label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Cart shortcut */}
          <button
            onClick={openCart}
            style={delay()}
            className="group mt-4 flex w-full animate-rowIn items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-gold-50 to-white px-4 py-3.5 text-left transition duration-500 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-lg hover:shadow-gold-400/20"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-white transition duration-500 group-hover:rotate-12 group-hover:scale-110">
                <ShoppingBag size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Your cart
                </span>
                <span className="block text-xs text-slate-500">
                  {count > 0
                    ? `${count} ${count === 1 ? "item" : "items"} waiting`
                    : "Nothing added yet"}
                </span>
              </span>
            </span>
            <ArrowUpRight
              size={18}
              className="text-gold-500 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>

          {/* Account */}
          <div
            style={delay()}
            className="mt-4 animate-rowIn rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#060607] via-[#0a3a78] to-[#1d7fe0] ring-2 ring-gold-200 text-white">
                    <User size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-display text-2xl font-semibold leading-tight text-royal">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-500"
                  >
                    <User size={15} /> Profile
                  </Link>
                  {user.isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="btn-gold !px-3 !py-2.5"
                    >
                      <ShieldCheck size={15} /> Admin
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        signout();
                        onClose();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-500"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  )}
                </div>
                {user.isAdmin && (
                  <button
                    onClick={() => {
                      signout();
                      onClose();
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold text-slate-500 transition hover:text-gold-500"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
                  Welcome
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Sign in to track orders and check out faster.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-500"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="btn-gold !px-3 !py-2.5"
                  >
                    Create account
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Contact */}
          <div
            style={delay()}
            className="mt-5 animate-rowIn space-y-2.5 pb-2 text-sm text-slate-600"
          >
            <a
              href={`tel:${country.phone.replace(/[^+\d]/g, "")}`}
              className="group flex items-center gap-3 transition hover:text-gold-500"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 transition duration-500 group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-white">
                <Phone size={15} />
              </span>
              {country.phone}
            </a>
            {country.phone2 && (
              <a
                href={`tel:${country.phone2.replace(/[^+\d]/g, "")}`}
                className="group flex items-center gap-3 transition hover:text-gold-500"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 transition duration-500 group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-white">
                  <Phone size={15} />
                </span>
                {country.phone2}
              </a>
            )}
            <a
              href={`mailto:${brand.email}`}
              className="group flex items-center gap-3 transition hover:text-gold-500"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 transition duration-500 group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-white">
                <Mail size={15} />
              </span>
              {brand.email}
            </a>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200">
                <MapPin size={15} />
              </span>
              <span>
                {country.city}
                {country.owner && (
                  <span className="block text-xs text-slate-400">
                    Owner: {country.owner}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-5 pb-5 pt-3 text-center text-[11px] tracking-[0.25em] text-slate-400 sm:px-8">
          <div className="hairline mb-3" />© {new Date().getFullYear()}{" "}
          {brand.name.toUpperCase()} · {brand.tagline.toUpperCase()}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
