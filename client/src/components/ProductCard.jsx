import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Play, Plus, ShoppingBag } from "lucide-react";
import { CATEGORIES } from "../config";
import { fitUrl, imagesOf, prefetchImages, videoOf } from "../lib/img";
import { pickVariant, viewOf } from "../lib/variants";
import { useShop } from "../store";
import Thumb from "./Thumb";
import ProductModal from "./ProductModal";
import VariantChips from "./VariantChips";
import { PriceTag, SaleBadge } from "./SaleBanner";

// Purani files (Admin, ProductDetail) yahin se Thumb import karti hain
export { Thumb };

export default function ProductCard({ p: base }) {
  const { add } = useShop();
  // Water: Pure / Mix / Custom (ya First time / Refill). Chuna hua option image + price badalta hai.
  const [vk, setVk] = useState(null);
  const cur = pickVariant(base, vk);
  const p = viewOf(base, cur?.key);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);

  const onAdd = () => {
    if (!p.in_stock) return;
    add(p.id, 1, cur?.key); // cart sidebar khud khul jata hai
    setDone(true);
    setTimeout(() => setDone(false), 1200);
  };

  return (
    <>
      <article className="card-glow group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-champ-200/70 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-champ-300 hover:shadow-2xl hover:shadow-champ-300/50">
        <div className="relative aspect-square overflow-hidden">
          <Link
            to={`/product/${p.id}`}
            aria-label={`View ${p.name}`}
            className="absolute inset-0 block"
            onMouseEnter={() => prefetchImages(imagesOf(p).slice(0, 2).map((u) => fitUrl(u, 1200)))}
            onTouchStart={() => prefetchImages(imagesOf(p).slice(0, 2).map((u) => fitUrl(u, 1200)))}
          >
            <Thumb key={imagesOf(p)[0] || "none"} p={p} />
            {!p.in_stock && (
              <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-bold text-royal">
                Out of stock
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060607]/75 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:animate-[sheen_1s_ease] group-hover:opacity-100" />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            <span className="rounded-full border border-white/30 bg-[#060607]/60 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
              {CATEGORIES[p.category]?.label}
            </span>
            <SaleBadge p={p} />
            {p.featured && (
              <span className="rounded-full champ-bg px-3 py-1 text-[11px] font-bold text-royal shadow">
                Bestseller
              </span>
            )}
            {videoOf(p) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-[#060607]/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                <Play size={10} fill="currentColor" /> Video
              </span>
            )}
          </div>

          {/* Bag icon: click par poori detail wala modal khulta hai */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`View details of ${p.name}`}
            title="View details"
            className="group/i absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-gradient-to-br from-[#060607] to-gold-600 text-white shadow-lg shadow-black/30 transition duration-300 hover:-translate-y-0.5 hover:scale-110 hover:shadow-xl hover:shadow-gold-500/50 active:scale-90"
          >
            <span className="absolute inset-0 rounded-full border border-champ-300/60 opacity-0 transition duration-500 group-hover/i:scale-150 group-hover/i:opacity-100" />
            <ShoppingBag
              size={18}
              className="transition duration-500 group-hover/i:scale-125"
            />
          </button>

          <span className="pointer-events-none absolute inset-x-0 bottom-4 flex translate-y-4 justify-center opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[#060607]/70 px-4 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur">
              View details <ArrowUpRight size={13} />
            </span>
          </span>
        </div>

        {cur && (
          <div className="border-b border-champ-100 bg-gold-50/50 px-5 py-3">
            <VariantChips p={base} value={cur.key} onChange={setVk} />
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          <Link to={`/product/${p.id}`}>
            <h3 className="font-display text-2xl font-bold leading-tight text-royal transition duration-300 hover:text-champ-600">
              {p.name}
            </h3>
          </Link>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500">
            {p.description}
          </p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <PriceTag p={p} big="text-xl" />
              <div className="text-xs text-neutral-500">{p.unit}</div>
            </div>
            <button
              onClick={onAdd}
              disabled={!p.in_stock}
              className={`${done ? "btn-champ" : "btn-gold"} !px-4 !py-2.5`}
            >
              {done ? <Check size={16} /> : <Plus size={16} />}
              {done ? "Added" : "Add"}
            </button>
          </div>
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 champ-bg transition duration-700 group-hover:scale-x-100" />
      </article>
      {open && (
        <ProductModal
          p={base}
          v={cur?.key}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
