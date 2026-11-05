import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Layers,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  X,
  MapPin,
  PartyPopper,
} from "lucide-react";
import Gallery from "./Gallery";
import { CATEGORIES, SHOP_INFO } from "../config";
import { trackProductView } from "../lib/api";
import { useGeo, useShop } from "../store";
import { PriceTag, SaleBadge } from "./SaleBanner";
import VariantChips from "./VariantChips";
import { pickVariant, viewOf } from "../lib/variants";

// Product ki poori detail wala luxury modal (card ke icon par click se khulta hai)
export default function ProductModal({ p: baseP, v: initV, onClose }) {
  const { fmt, country } = useGeo();
  const { add } = useShop();
  // Water options (Pure / Mix / Custom ...): chuna hua option price + image badalta hai
  const [vk, setVk] = useState(initV || null);
  const cur = pickVariant(baseP, vk);
  const p = viewOf(baseP, cur?.key);
  const [qty, setQty] = useState(1);
  const [out, setOut] = useState(false);

  const close = () => {
    setOut(true);
    setTimeout(onClose, 260);
  };

  // modal khulna bhi product visit hai
  useEffect(() => {
    trackProductView(p.id);
  }, [p.id]);

  // page scroll lock + Esc se band
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cat = CATEGORIES[p.category];
  const aqua = p.category === "aqua";

  const details = [
    { icon: Tag, label: "Category", value: cat?.label },
    { icon: Layers, label: "Pack / size", value: p.unit || "Standard" },
    {
      icon: Sparkles,
      label: "Availability",
      value: p.in_stock ? "In stock, ready to ship" : "Out of stock",
    },
    {
      icon: Truck,
      label: "Payment",
      value: country.code === "PK" ? "Cash on delivery" : "Pay on delivery",
    },
    {
      icon: MapPin,
      label: "Delivery",
      value: aqua
        ? "Pakistan only"
        : `${SHOP_INFO.delivery.title} · ${SHOP_INFO.delivery.note}`,
    },
    { icon: ShieldCheck, label: "Quality", value: "Fresh, quality checked" },
    ...(aqua
      ? []
      : [
          {
            icon: PartyPopper,
            label: "Event rates",
            value: `Weddings, birthdays, baby born · Special Box $${SHOP_INFO.special.box.price} (${SHOP_INFO.special.box.pieces} pcs)`,
          },
        ]),
  ];

  const onAdd = () => {
    if (!p.in_stock) return;
    add(p.id, qty, cur?.key);
    close();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-[#060607]/75 backdrop-blur-md ${out ? "animate-fadeOut" : "fade-in"}`}
      />
      <div
        className={`relative grid max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl shadow-black/60 sm:rounded-[2rem] md:h-[min(94vh,760px)] md:grid-cols-2 md:grid-rows-1 md:overflow-hidden ${out ? "animate-fadeOut" : "animate-modalIn"}`}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="group/x absolute right-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-[#060607]/70 text-white backdrop-blur transition duration-300 hover:rotate-90 hover:scale-110 hover:bg-gold-600 md:right-4 md:top-4"
        >
          <X size={18} />
        </button>

        {/* Image side: badi image + neeche saari images ke thumbnails */}
        <div className="relative flex min-h-0 flex-col bg-royal md:h-full">
          <Gallery
            key={cur?.key || "base"}
            p={p}
            variant="modal"
            overlay={
              <>
                <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
                  <span className="animate-rise rounded-full border border-white/25 bg-[#060607]/70 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
                    {cat?.icon} {cat?.label}
                  </span>
                  <SaleBadge p={p} />
                  {p.featured && (
                    <span
                      style={{ animationDelay: "90ms" }}
                      className="animate-rise rounded-full champ-bg px-3.5 py-1.5 text-[11px] font-bold text-royal shadow-lg"
                    >
                      Bestseller
                    </span>
                  )}
                </div>
                <div
                  style={{ animationDelay: "160ms" }}
                  className="pointer-events-none absolute bottom-4 left-4 z-10 animate-rise rounded-2xl border border-white/20 bg-[#060607]/70 px-4 py-2 text-white backdrop-blur-md"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-champ-200">
                    Price
                  </div>
                  <PriceTag p={p} big="text-xl" light />
                </div>
                {!p.in_stock && (
                  <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#060607]/60 text-lg font-bold text-white">
                    Out of stock
                  </div>
                )}
              </>
            }
          />
        </div>

        {/* Details side */}
        <div className="flex flex-col p-6 sm:p-8 md:max-h-[94vh] md:overflow-y-auto">
          <span className="eyebrow">Product details</span>
          <h2 className="mt-3 animate-rise font-display text-4xl font-bold leading-tight text-royal sm:text-5xl">
            {p.name}
          </h2>
          <div className="mt-3 flex items-end gap-3">
            <PriceTag p={p} big="text-3xl" />
            <span className="pb-1 text-sm text-neutral-500">{p.unit}</span>
          </div>
          {cur && (
            <VariantChips
              p={baseP}
              value={cur.key}
              onChange={setVk}
              className="mt-4"
            />
          )}
          <div className="hairline my-5" />
          <p className="text-[15px] leading-relaxed text-neutral-600">
            {p.description || "Handmade with care. Fresh every day."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {details.map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                style={{ animationDelay: `${120 + i * 70}ms` }}
                className="group/tile animate-rowIn flex items-start gap-3 rounded-2xl border border-gold-100 bg-gold-50/60 p-3.5 transition duration-300 hover:-translate-y-1 hover:border-champ-300 hover:bg-white hover:shadow-lg hover:shadow-champ-200/40"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#060607] to-gold-600 text-white transition duration-300 group-hover/tile:rotate-6 group-hover/tile:scale-110">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-600">
                    {label}
                  </div>
                  <div className="text-sm font-semibold leading-snug text-royal">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-7">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full border border-gold-200 bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                  className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-gold-50 active:scale-90"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-base font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="Increase"
                  className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-gold-50 active:scale-90"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={onAdd}
                disabled={!p.in_stock}
                className="btn-gold flex-1 !py-3.5"
              >
                <ShoppingBag size={16} />
                Add to cart · {fmt(p.price * qty)}
              </button>
            </div>
            <Link
              to={`/product/${p.id}`}
              onClick={onClose}
              className="link-draw mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal transition hover:gap-2.5"
            >
              Open full page <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
