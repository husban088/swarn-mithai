import { Link } from "react-router-dom";
import {
  ArrowUp,
  Gift,
  Mail,
  MapPin,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";
import Logo from "./Logo";
import { CATEGORIES, SHOP_INFO, brandFor } from "../config";
import { useGeo } from "../store";

const col =
  "text-sm text-champ-100/70 transition duration-300 hover:pl-1.5 hover:text-champ-300";

export default function Footer() {
  const { country } = useGeo();
  const brand = brandFor(country.code);
  const isPK = country.code === "PK";
  return (
    <footer className="grain relative mt-12 overflow-hidden bg-royal-deep text-champ-100">
      <div className="hairline absolute inset-x-0 top-0" />
      <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 animate-glow rounded-full bg-champ-400/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center font-display text-[22vw] font-bold leading-none text-white/[0.03]">
        {brand.name}
      </div>

      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-champ-100/70">
            {isPK
              ? "Evelyn One purified drinking water, tested and sealed fresh. Delivered to your door with care."
              : "Made in small batches with pure ghee, real khoya and patience."}
          </p>
        </div>
        <div>
          <h4 className="font-display text-2xl font-bold text-champ-300">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link className={col} to="/about">
                About us
              </Link>
            </li>
            <li>
              <Link className={col} to="/services">
                Our services
              </Link>
            </li>
            <li>
              <Link className={col} to="/why-us">
                Why choose us
              </Link>
            </li>
            <li>
              <Link className={col} to="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-2xl font-bold text-champ-300">
            Shop
          </h4>
          <ul className="mt-4 space-y-2.5">
            {country.categories.map((c) => (
              <li key={c}>
                <Link className={col} to={`/shop?cat=${c}`}>
                  {CATEGORIES[c].label}
                </Link>
              </li>
            ))}
            <li>
              <Link className={col} to="/shop">
                All products
              </Link>
            </li>
            <li>
              <Link className={col} to="/cart">
                Checkout
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-2xl font-bold text-champ-300">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-champ-100/70">
            {country.owner && (
              <li className="flex items-center gap-2.5">
                <UserRound size={15} className="text-champ-400" />
                {country.owner} · Owner
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-champ-400" />
              <a href={`tel:${country.phone.replace(/[^+\d]/g, "")}`}>
                {country.phone}
              </a>
            </li>
            {country.phone2 && (
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-champ-400" />
                <a href={`tel:${country.phone2.replace(/[^+\d]/g, "")}`}>
                  {country.phone2}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-champ-400" />
              <a href={`mailto:${brand.email}`} className="break-all">
                {brand.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-champ-400" />
              {country.city}
            </li>
            {country.categories.includes("sweets") && (
              <>
                <li className="flex items-center gap-2.5">
                  <Truck size={15} className="text-champ-400" />
                  {SHOP_INFO.delivery.title} (
                  {SHOP_INFO.delivery.note.replace(".", "")})
                </li>
                <li className="flex items-center gap-2.5">
                  <Gift size={15} className="text-champ-400" />
                  Special Box ${SHOP_INFO.special.box.price} ·{" "}
                  {SHOP_INFO.special.box.pieces} pieces
                </li>
                <li className="pl-[27px] text-xs text-champ-100/50">
                  Special rates for weddings, birthdays and baby born.
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-5">
        <div className="container-x flex items-center justify-between gap-4 text-xs text-champ-100/60">
          <span>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 font-semibold text-champ-300 transition hover:text-white"
          >
            Back to top
            <span className="grid h-8 w-8 place-items-center rounded-full border border-champ-300/40 transition duration-300 group-hover:-translate-y-1 group-hover:bg-champ-400 group-hover:text-royal">
              <ArrowUp size={14} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
