import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import PageHero from "../components/PageHero";
import EventBanner, { DeliveryNote } from "../components/EventBanner";
import SaleBanner from "../components/SaleBanner";
import { CATEGORIES } from "../config";
import { useGeo, useShop } from "../store";

const PAGE_SIZE = 12; // ek page par 12 products

// 1 2 3 … 9 10 jaisi page list
function pageList(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, total - 1, total, cur - 1, cur, cur + 1]);
  const nums = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("…" + n);
    out.push(n);
  });
  return out;
}

export default function Shop() {
  const { country } = useGeo();
  const { products, loading, error, reload } = useShop();
  const [params, setParams] = useSearchParams();
  const urlQ = params.get("q") || "";
  const [q, setQ] = useState(urlQ);
  const [showFilters, setShowFilters] = useState(false);
  const gridRef = useRef(null);

  // Page number + saare filters URL me rehte hain (?page=2&sort=low ...).
  // Is liye product detail se Back karne par browser wahi URL wapis kholta hai
  // aur aap usi pagination page par ate ho.
  const sort = params.get("sort") || "new";
  const minP = params.get("min") || "";
  const maxP = params.get("max") || "";
  const bestOnly = params.get("best") === "1";
  const stockOnly = params.get("stock") === "1";
  const page = Math.max(1, parseInt(params.get("page"), 10) || 1);

  // URL params badalne ka ek hi tareeqa. replace:true => history me extra entry nahi banti,
  // is liye Back dabane par seedha product se pehle wale shop page par ate ho.
  // Filter badle to page 1 par wapis (keepPage = false), page badle to keepPage = true.
  const update = (changes, keepPage = false) => {
    const n = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === "" || v == null || v === false) n.delete(k);
      else n.set(k, String(v));
    });
    if (!keepPage) n.delete("page");
    setParams(n, { replace: true });
  };
  const setSort = (v) => update({ sort: v === "new" ? "" : v });
  const setMinP = (v) => update({ min: v });
  const setMaxP = (v) => update({ max: v });
  const setBestOnly = (v) => update({ best: v ? "1" : "" });
  const setStockOnly = (v) => update({ stock: v ? "1" : "" });
  const onSearch = (v) => {
    setQ(v);
    update({ q: v });
  };

  // Product detail ka "Back to shop" button isi URL par wapis bhejta hai
  useEffect(() => {
    try {
      const qs = params.toString();
      sessionStorage.setItem("swarn:shopUrl", "/shop" + (qs ? "?" + qs : ""));
    } catch {
      /* private mode: ignore */
    }
  }, [params]);

  // URL ka ?q= badle (jaise Home ki varieties) to search bar bhi badle
  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  const cat = country.categories.includes(params.get("cat"))
    ? params.get("cat")
    : "all";
  const setCat = (c) => {
    const n = new URLSearchParams(params);
    if (c === "all") n.delete("cat");
    else n.set("cat", c);
    n.delete("page"); // category badle to page 1 se shuru
    setParams(n);
  };
  const showEvent = cat !== "aqua";

  const inCat = useMemo(
    () => products.filter((p) => cat === "all" || p.category === cat),
    [products, cat],
  );
  const bounds = useMemo(() => {
    const v = inCat.map((p) => p.price).filter((n) => Number.isFinite(n));
    return v.length
      ? { lo: Math.floor(Math.min(...v)), hi: Math.ceil(Math.max(...v)) }
      : { lo: 0, hi: 0 };
  }, [inCat]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const lo = minP === "" ? null : Number(minP);
    const hi = maxP === "" ? null : Number(maxP);
    let l = inCat.filter(
      (p) =>
        (!term ||
          p.name.toLowerCase().includes(term) ||
          (p.description || "").toLowerCase().includes(term)) &&
        (lo == null || p.price >= lo) &&
        (hi == null || p.price <= hi) &&
        (!bestOnly || p.featured) &&
        (!stockOnly || p.in_stock),
    );
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "az") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [inCat, q, sort, minP, maxP, bestOnly, stockOnly]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, totalPages);
  const from = (cur - 1) * PAGE_SIZE;
  const view = list.slice(from, from + PAGE_SIZE);

  // Pagination button dabane par page badlo aur grid ke shuru par scroll karo
  // (sirf button click par; Back se wapis ane par scroll App.jsx wapis set karta hai)
  const goPage = (n) => {
    update({ page: n <= 1 ? "" : n }, true);
    requestAnimationFrame(() => {
      const el = gridRef.current;
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    });
  };

  const activeCount =
    (q.trim() ? 1 : 0) +
    (minP !== "" || maxP !== "" ? 1 : 0) +
    (bestOnly ? 1 : 0) +
    (stockOnly ? 1 : 0) +
    (sort !== "new" ? 1 : 0);
  const reset = () => {
    setQ("");
    const n = new URLSearchParams(params);
    ["q", "sort", "min", "max", "best", "stock", "page"].forEach((k) =>
      n.delete(k),
    );
    setParams(n, { replace: true });
  };

  const tab = (key, label, on) => (
    <button
      key={key}
      onClick={() => setCat(key)}
      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-300 ${on ? "champ-bg border-transparent text-royal shadow-md shadow-champ-300/40" : "border-champ-200 bg-white text-neutral-600 hover:-translate-y-0.5 hover:border-champ-400 hover:text-royal"}`}
    >
      {label}
    </button>
  );

  const check = (on, set, label) => (
    <label className="group flex cursor-pointer select-none items-center gap-2.5 text-sm font-semibold text-neutral-700">
      <span
        className={`grid h-5 w-5 place-items-center rounded-md border transition duration-300 ${on ? "border-gold-500 bg-gold-500 text-white" : "border-gold-200 bg-white group-hover:border-gold-400"}`}
      >
        {on && (
          <svg
            viewBox="0 0 12 12"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 6.5l2.3 2.3 4.7-5" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => set(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );

  const pageBtn =
    "grid h-11 min-w-11 place-items-center rounded-full border px-3 text-sm font-bold transition duration-300";

  return (
    <div>
      <PageHero
        eyebrow="The collection"
        title="Our"
        accent={cat === "all" ? "collection" : CATEGORIES[cat].label}
        crumb="Shop"
        text={country.tagline}
      />
      <div className="container-x py-12">
        <SaleBanner variant="compact" className="mb-4" />
        {showEvent && (
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <EventBanner variant="compact" />
            <DeliveryNote className="h-full !rounded-3xl !p-6" />
          </div>
        )}

        {/* Categories + search + sort */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tab("all", "All", cat === "all")}
            {country.categories.map((c) =>
              tab(c, CATEGORIES[c].label, cat === c),
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-600"
              />
              <input
                value={q}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search products"
                className="field !pl-11 !pr-10 sm:w-64"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => onSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-neutral-400 transition hover:bg-gold-50 hover:text-gold-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field sm:w-52"
            >
              <option value="new">Newest</option>
              <option value="az">Name: A to Z</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition duration-300 ${showFilters ? "border-gold-500 bg-gold-500 text-white" : "border-gold-200 bg-white text-neutral-700 hover:border-gold-400 hover:text-gold-600"}`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-gold-600 ring-1 ring-gold-200">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <div
          className={`grid transition-all duration-500 ease-out ${showFilters ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid gap-5 rounded-3xl border border-champ-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
              <div>
                <span className="label">Price range ({country.currency})</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={minP}
                    onChange={(e) => setMinP(e.target.value)}
                    placeholder={bounds.hi ? `Min ${bounds.lo}` : "Min"}
                    className="field"
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={maxP}
                    onChange={(e) => setMaxP(e.target.value)}
                    placeholder={bounds.hi ? `Max ${bounds.hi}` : "Max"}
                    className="field"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end gap-3">
                {check(bestOnly, setBestOnly, "Bestsellers only")}
                {check(stockOnly, setStockOnly, "In stock only")}
              </div>
              <div className="hidden lg:block" />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={reset}
                  disabled={activeCount === 0}
                  className="btn-line w-full !py-3"
                >
                  <RotateCcw size={15} /> Reset filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-600">
            <span>
              {list.length === 0
                ? "No products"
                : `Showing ${from + 1}–${Math.min(from + PAGE_SIZE, list.length)} of ${list.length} products`}
            </span>
            {activeCount > 0 && (
              <button
                onClick={reset}
                className="font-semibold text-gold-600 underline-offset-4 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
            {error}{" "}
            <button onClick={reload} className="ml-2 font-semibold underline">
              Try again
            </button>
          </div>
        )}

        <div
          id="shop-grid"
          ref={gridRef}
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-3xl bg-gold-50"
                />
              ))
            : view.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 70}>
                  <ProductCard p={p} />
                </Reveal>
              ))}
        </div>

        {!loading && !error && list.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-neutral-500">
              {products.length === 0
                ? "No products added yet."
                : "No products match your search or filters."}
            </p>
            {activeCount > 0 && (
              <button onClick={reset} className="btn-line mt-5">
                <RotateCcw size={15} /> Reset filters
              </button>
            )}
          </div>
        )}

        {/* Pagination (page ke end par) */}
        {!loading && totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-14 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => goPage(cur - 1)}
              disabled={cur === 1}
              aria-label="Previous page"
              className={`${pageBtn} border-gold-200 bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500 hover:text-white disabled:pointer-events-none disabled:opacity-40`}
            >
              <ChevronLeft size={18} />
            </button>
            {pageList(cur, totalPages).map((n) =>
              typeof n === "string" ? (
                <span key={n} className="px-1 text-neutral-400">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => goPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === cur ? "page" : undefined}
                  className={`${pageBtn} ${n === cur ? "border-transparent bg-gold-500 text-white shadow-lg shadow-gold-400/40" : "border-gold-200 bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-gold-500 hover:text-gold-600"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => goPage(cur + 1)}
              disabled={cur === totalPages}
              aria-label="Next page"
              className={`${pageBtn} border-gold-200 bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500 hover:text-white disabled:pointer-events-none disabled:opacity-40`}
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
        {!loading && totalPages > 1 && (
          <p className="mt-3 text-center text-xs text-neutral-500">
            Page {cur} of {totalPages}
          </p>
        )}
      </div>
    </div>
  );
}
