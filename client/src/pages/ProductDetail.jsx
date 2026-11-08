import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import Gallery from "../components/Gallery";
import Reviews, { Stars } from "../components/Reviews";
import Reveal from "../components/Reveal";
import EventBanner, { DeliveryNote } from "../components/EventBanner";
import { trackProductView } from "../lib/api";
import { PriceTag, SaleBadge } from "../components/SaleBanner";
import VariantChips from "../components/VariantChips";
import WaterComposition from "../components/WaterComposition";
import { pickVariant, viewOf } from "../lib/variants";
import { CATEGORIES } from "../config";
import { useGeo, useShop, useToast } from "../store";
import { lastShopUrl, navTrack } from "../lib/nav";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  // Shop se aye the? To Back = browser back (usi pagination page + scroll par). Warna last shop URL.
  const cameFromShop = useRef(navTrack.prev === "/shop").current;
  const goBackToShop = (e) => {
    if (cameFromShop) {
      e.preventDefault();
      nav(-1);
    }
  };
  const { fmt, country } = useGeo();
  const { products, loading, add } = useShop();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const [sum, setSum] = useState(null);
  // Options (Mithai: Signature Box / Special Box, Water: Pure / Mix ...): chuna hua option image + price badalta hai
  const [vk, setVk] = useState(null);

  const base = products.find((x) => x.id === id);
  const cur = base ? pickVariant(base, vk) : null;
  const p = base ? viewOf(base, cur?.key) : undefined;
  const found = !!p;

  useEffect(() => {
    setQty(1);
    setVk(null);
  }, [id]);

  // Har dafa product page khulne par visit count hota hai (admin ka bhi, koi session limit nahi)
  useEffect(() => {
    if (found) trackProductView(id);
  }, [id, found]);

  if (loading) {
    return (
      <div className="container-x py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-[2rem] bg-gold-50" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded-xl bg-gold-50" />
            <div className="h-24 animate-pulse rounded-xl bg-gold-50" />
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="container-x grid min-h-[50vh] place-items-center py-16 text-center">
        <div>
          <h1 className="font-display text-5xl font-bold text-royal">
            Product not found
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            This product is not available in {country.name}.
          </p>
          <Link
            to={lastShopUrl()}
            onClick={goBackToShop}
            className="btn-gold mt-6"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter((x) => x.category === p.category && x.id !== p.id)
    .slice(0, 4);

  const addToCart = () => {
    if (!p.in_stock) return;
    add(p.id, qty, cur?.key);
    setDone(true);
    toast(`${qty} × ${p.name}${cur ? ` - ${cur.label}` : ""} added to cart`);
    setTimeout(() => setDone(false), 1400);
  };
  const buyNow = () => {
    if (!p.in_stock) return;
    add(p.id, qty, cur?.key);
    nav("/checkout");
  };

  return (
    <div className="container-x py-10">
      <Link
        to={lastShopUrl()}
        onClick={goBackToShop}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition hover:gap-3 hover:text-royal"
      >
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Gallery p={p} />

        <div className="animate-rise">
          <span className="rounded-full border border-gold-200 bg-gold-50 px-4 py-1.5 text-xs font-semibold text-royal">
            {CATEGORIES[p.category]?.icon} {CATEGORIES[p.category]?.label}
          </span>
          <SaleBadge p={p} className="ml-2 align-middle" />
          <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-royal sm:text-6xl">
            {p.name}
          </h1>
          {sum && sum.count > 0 && (
            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("reviews")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-royal transition hover:text-gold-600"
            >
              <Stars value={sum.avg} size={17} />
              {sum.avg.toFixed(1)} · {sum.count} review
              {sum.count > 1 ? "s" : ""}
            </a>
          )}
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            {p.description}
          </p>

          <div className="mt-6 flex items-end gap-3">
            <PriceTag p={p} big="text-4xl" />
            <span className="pb-1.5 text-sm text-neutral-500">{p.unit}</span>
          </div>
          {cur && (
            <div className="mt-4 max-w-md">
              <VariantChips p={base} value={cur.key} onChange={setVk} />
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-gold-200 bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-gold-50"
              >
                <Minus size={16} />
              </button>
              <span className="w-9 text-center text-base font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                aria-label="Increase"
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-gold-50"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={addToCart}
              disabled={!p.in_stock}
              className="btn-gold !px-8 !py-3.5"
            >
              {done ? <Check size={16} /> : <ShoppingBag size={16} />}
              {done ? "Added" : "Add to cart"}
            </button>
            <button
              onClick={buyNow}
              disabled={!p.in_stock}
              className="btn-line !px-8 !py-3.5"
            >
              Buy now
            </button>
          </div>
          <p className="mt-4 text-sm font-semibold text-royal">
            Total: {fmt(p.price * qty)}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-gold-100 bg-gold-50/60 p-4 text-sm text-royal">
              <Truck size={20} className="text-gold-600" />
              {country.code === "PK" ? "Cash on delivery" : "Pay on delivery"}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gold-100 bg-gold-50/60 p-4 text-sm text-royal">
              <ShieldCheck size={20} className="text-gold-600" />
              Fresh, quality checked
            </div>
          </div>
          {p.category === "aqua" && <WaterComposition className="mt-6" />}
          <DeliveryNote className="mt-3" />
          <EventBanner variant="compact" className="mt-3" />
        </div>
      </div>

      <Reviews key={p.id} productId={p.id} onSummary={setSum} />

      {related.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-royal">
              You may also like
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r, i) => (
              <Reveal key={r.id} delay={i * 90}>
                <ProductCard p={r} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
