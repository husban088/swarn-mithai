import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { api, json } from "../lib/api";
import { fmtMoney } from "../lib/format";
import { useShop, useToast } from "../store";
import { useAdminScope } from "../lib/adminScope";
import SaleBanner from "./SaleBanner";
import Thumb from "./Thumb";

// Admin > "Sale offers": 10% se 30% tak sale kisi bhi product (ya sab) par lagayein / hatayein.
// Apply / Remove dabate hi server me save hota hai aur Home / Shop / Product pages par
// banner, "-20% OFF" badge aur nayi price foran dikhne lagti hai.
const CHOICES = [10, 15, 20, 25, 30];
const FILTERS = [
  { key: "all", label: "All" },
  { key: "on", label: "On sale" },
  { key: "off", label: "No sale" },
];

const seg = (on) =>
  `rounded-2xl border px-3 py-3 text-sm font-bold transition duration-300 ${
    on
      ? "gold-bg border-transparent text-white shadow-lg shadow-gold-500/30"
      : "border-gold-200 bg-white text-neutral-600 hover:-translate-y-0.5 hover:bg-gold-50 hover:shadow-md"
  }`;

export default function AdminSale() {
  const toast = useToast();
  const sc = useAdminScope();
  const { reload } = useShop();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [percent, setPercent] = useState(20);
  const [scope, setScope] = useState("all"); // "all" | "ids"
  const [sel, setSel] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const r = await api("/admin/products");
      setRows(r.products || []);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    load();
  }, [load]);

  const usd = sc.cur === "USD";
  const baseOf = (p) => {
    const v =
      Array.isArray(p.variants) && p.variants.length ? p.variants[0] : p;
    const n = usd ? v.price_usd : v.price_pkr;
    return n == null || n === "" ? null : Number(n);
  };
  const money = (n) =>
    fmtMoney(usd ? Math.round(n * 100) / 100 : Math.round(n), sc.cur);

  const onSale = useMemo(
    () => rows.filter((p) => Number(p.sale_percent) > 0),
    [rows],
  );
  const topPct = onSale.length
    ? Math.max(...onSale.map((p) => Number(p.sale_percent)))
    : 0;

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((p) => {
      const pct = Number(p.sale_percent) || 0;
      if (filter === "on" && !pct) return false;
      if (filter === "off" && pct) return false;
      return (
        !t ||
        String(p.name || "")
          .toLowerCase()
          .includes(t)
      );
    });
  }, [rows, q, filter]);

  const target = scope === "all" ? rows.length : sel.size;
  const allShownSelected =
    shown.length > 0 && shown.every((p) => sel.has(p.id));

  const toggle = (id) => {
    setScope("ids");
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectShown = () => {
    setScope("ids");
    setSel((s) => {
      const n = new Set(s);
      if (allShownSelected) shown.forEach((p) => n.delete(p.id));
      else shown.forEach((p) => n.add(p.id));
      return n;
    });
  };

  const send = async (pct, forceAll = false) => {
    const useAll = forceAll || scope === "all";
    if (!useAll && !sel.size)
      return toast("Kam az kam ek product chunein", "err");
    setBusy(true);
    try {
      await api(
        "/admin/sale",
        json("POST", {
          percent: pct,
          scope: useAll ? "all" : "ids",
          ids: useAll ? undefined : [...sel],
        }),
      );
      toast(
        pct
          ? `${pct}% sale lag gayi`
          : useAll
            ? "Sab products se sale hat gayi"
            : "Selected products se sale hat gayi",
      );
      await load();
      reload(); // Home banner + badges foran update
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const preview = {
    percent,
    count: scope === "all" ? rows.length : sel.size,
    total: rows.length,
    all: scope === "all" || (rows.length > 0 && sel.size === rows.length),
  };

  return (
    <div className="min-w-0 space-y-5 sm:space-y-7">
      {/* ===== Hero / status ===== */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#060607] via-[#0a3a78] to-[#1d7fe0] p-5 text-white shadow-2xl shadow-champ-300/40 sm:rounded-[2.25rem] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[#4aa3f0]/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
              <Sparkles size={12} /> Sale offers
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] sm:text-5xl">
              Sale control room
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              10% se 30% tak discount lagayein. Apply karte hi Home banner,
              badges aur nayi price live ho jati hain.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3">
            {[
              [onSale.length, "On sale"],
              [topPct ? `${topPct}%` : "—", "Top discount"],
              [rows.length, "Products"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur sm:min-w-[104px] sm:px-5"
              >
                <div className="text-2xl font-extrabold leading-none sm:text-3xl">
                  {v}
                </div>
                <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold ${onSale.length ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/70"}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${onSale.length ? "animate-pulse bg-emerald-300" : "bg-white/50"}`}
            />
            {onSale.length
              ? `Live · ${onSale.length} of ${rows.length} products`
              : "No sale running"}
          </span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/20"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          {onSale.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => send(0, true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-300/40 bg-red-500/20 px-4 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/40 disabled:opacity-50"
            >
              <XCircle size={14} /> Remove sale from all
            </button>
          )}
        </div>
      </section>

      {/* ===== Controls + banner preview ===== */}
      <div className="grid items-start gap-5 sm:gap-7 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-[1.75rem] border border-gold-100 bg-white p-5 shadow-xl shadow-champ-200/40 sm:rounded-[2.25rem] sm:p-7">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
            1 · Discount
          </div>
          <div className="mt-3 text-center">
            <span className="bg-gradient-to-r from-[#0a3a78] to-[#1d7fe0] bg-clip-text text-6xl font-extrabold leading-none text-transparent sm:text-7xl">
              {percent}%
            </span>
            <span className="ml-2 align-top text-sm font-bold tracking-[0.3em] text-neutral-400">
              OFF
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            step="1"
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="mt-4 w-full accent-[#1d7fe0]"
            aria-label="Sale percent"
          />
          <div className="mt-3 grid grid-cols-5 gap-2">
            {CHOICES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setPercent(c)}
                className={seg(percent === c)}
              >
                {c}%
              </button>
            ))}
          </div>

          <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
            2 · Kin products par?
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScope("all")}
              className={seg(scope === "all")}
            >
              All products
              <span className="block text-[11px] font-medium opacity-80">
                {rows.length} items
              </span>
            </button>
            <button
              type="button"
              onClick={() => setScope("ids")}
              className={seg(scope === "ids")}
            >
              Selected
              <span className="block text-[11px] font-medium opacity-80">
                {sel.size} chosen
              </span>
            </button>
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button
              type="button"
              disabled={busy || loading || !target}
              onClick={() => send(percent)}
              className="btn-gold w-full justify-center whitespace-nowrap !py-3.5 disabled:opacity-50"
            >
              <Check size={16} />
              {busy ? "Saving…" : `Apply ${percent}%`}
            </button>
            <button
              type="button"
              disabled={busy || loading || !target}
              onClick={() => send(0)}
              className="btn-line w-full justify-center whitespace-nowrap !py-3.5 disabled:opacity-50"
            >
              <XCircle size={15} />
              {scope === "all" ? "Remove sale" : "Remove (selected)"}
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">
            Apply = foran lag jati hai · Remove = foran hat jati hai
          </p>
        </section>

        <section className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
            <BadgePercent size={14} /> Home page banner preview
          </div>
          {preview.count > 0 ? (
            <div className="overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]">
              <SaleBanner variant="full" preview={preview} />
            </div>
          ) : (
            <div className="grid min-h-[200px] place-items-center rounded-[1.75rem] border border-dashed border-champ-300 bg-gold-50/50 p-8 text-center text-sm text-neutral-500 sm:rounded-[2.25rem]">
              Preview ke liye products chunein.
            </div>
          )}
        </section>
      </div>

      {/* ===== Products ===== */}
      <section className="min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
              3 · Products
            </div>
            <p className="text-xs text-neutral-500">
              Card par click karke select karein, phir Apply dabayein.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search product…"
                className="field !pl-10 sm:w-60"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  type="button"
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${filter === f.key ? "gold-bg border-transparent text-white shadow-md" : "border-gold-200 bg-white text-neutral-600 hover:bg-gold-50"}`}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={selectShown}
                disabled={!shown.length}
                className="rounded-full border border-champ-300 bg-white px-4 py-2 text-xs font-semibold text-royal transition hover:bg-gold-50 disabled:opacity-50"
              >
                {allShownSelected ? "Unselect shown" : "Select shown"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-3xl bg-gold-50"
              />
            ))}
          {!loading &&
            shown.map((p) => {
              const base = baseOf(p);
              const pct = Number(p.sale_percent) || 0;
              const checked = scope === "ids" && sel.has(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  aria-pressed={checked}
                  className={`group relative flex min-w-0 items-center gap-3 rounded-3xl border bg-white p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-champ-200/50 ${checked ? "border-gold-500 shadow-lg ring-2 ring-gold-200" : "border-gold-100"}`}
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gold-100 bg-gold-50 sm:h-[72px] sm:w-[72px]">
                    <Thumb p={p} w={200} zoom={false} />
                  </span>
                  <span className="min-w-0 flex-1 pr-7">
                    <span className="block truncate font-semibold text-royal">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-sm">
                      {base == null ? (
                        "—"
                      ) : pct ? (
                        <>
                          <b className="text-gold-600">
                            {money(base * (1 - pct / 100))}
                          </b>{" "}
                          <span className="text-xs text-neutral-400 line-through">
                            {money(base)}
                          </span>
                        </>
                      ) : (
                        <b className="text-royal">{money(base)}</b>
                      )}
                    </span>
                    <span className="mt-1 block">
                      {pct ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#0a3a78] to-[#1d7fe0] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                          <BadgePercent size={10} /> {pct}% OFF
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">
                          No sale
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border transition ${checked ? "gold-bg border-transparent text-white" : "border-gold-200 bg-white text-transparent group-hover:border-gold-500"}`}
                  >
                    <Check size={13} />
                  </span>
                </button>
              );
            })}
          {!loading && shown.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-gold-200 p-10 text-center text-sm text-neutral-500">
              {rows.length
                ? "Koi product nahi mila."
                : "Pehle products add karein."}
            </div>
          )}
        </div>
      </section>

      {/* ===== Sticky action bar (selection ke baad) ===== */}
      {scope === "ids" && sel.size > 0 && (
        <div className="sticky bottom-3 z-30 mx-auto w-full max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-champ-200 bg-white/90 p-2.5 pl-5 shadow-2xl shadow-champ-300/50 backdrop-blur-xl">
            <span className="text-sm font-bold text-royal">
              {sel.size} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => send(percent)}
                className="btn-gold !px-5 !py-2.5 text-sm disabled:opacity-50"
              >
                <Check size={15} /> Apply {percent}%
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => send(0)}
                className="btn-line !px-4 !py-2.5 text-sm disabled:opacity-50"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setSel(new Set())}
                aria-label="Clear selection"
                className="grid h-10 w-10 place-items-center rounded-full border border-gold-200 text-neutral-500 transition hover:bg-gold-50"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
