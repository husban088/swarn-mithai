import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  FileText,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { api } from "../lib/api";
import { fmtMoney, normStatus, shortId } from "../lib/format";
import {
  downloadBulkInvoices,
  downloadInvoice,
  downloadInvoicesZip,
} from "../lib/invoice";
import { ORDER_STATUSES, STATUS_STYLE } from "../config";
import { useToast } from "../store";
import { useAdminScope } from "../lib/adminScope";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MON_SHORT = MONTHS.map((m) => m.slice(0, 3));
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const round2 = (n) => Math.round(n * 100) / 100;

const PRESETS = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "2m", label: "2 months" },
  { key: "3m", label: "3 months" },
  { key: "6m", label: "6 months" },
  { key: "12m", label: "12 months" },
];

function presetRange(key) {
  const now = new Date();
  const today = ymd(now);
  if (key === "today") return { from: today, to: today };
  if (key === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return { from: ymd(d), to: today };
  }
  if (key === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    return { from: ymd(d), to: today };
  }
  if (key === "month")
    return {
      from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
      to: today,
    };
  if (key === "year") return { from: `${now.getFullYear()}-01-01`, to: today };
  // "N months" = is mahine samet pichhle N mahine (calendar months, 1 tarikh se aaj tak)
  const m = /^(\d+)m$/.exec(key);
  if (m) {
    const d = new Date(
      now.getFullYear(),
      now.getMonth() - (Number(m[1]) - 1),
      1,
    );
    return { from: ymd(d), to: today };
  }
  return { from: "", to: "" };
}

// bucket key + label
function bucketOf(date, group) {
  const y = date.getFullYear();
  const m = date.getMonth();
  if (group === "year")
    return { key: String(y), label: String(y), sort: y * 10000 };
  if (group === "month")
    return {
      key: `${y}-${pad(m + 1)}`,
      label: `${MON_SHORT[m]} ${y}`,
      sort: y * 10000 + (m + 1) * 100,
    };
  return {
    key: ymd(date),
    label: `${pad(date.getDate())} ${MON_SHORT[m]} ${y}`,
    sort: y * 10000 + (m + 1) * 100 + date.getDate(),
  };
}

// chart ke liye khali dino/mahino ko bhi zero ke saath bharna
function fillGaps(map, group) {
  const arr = [...map.values()].sort((a, b) => a.sort - b.sort);
  if (arr.length < 2) return arr;
  const first = arr[0];
  const last = arr[arr.length - 1];
  const parse = (b) => {
    const [y, m = "1", d = "1"] = b.key.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  let cur = parse(first);
  const end = parse(last);
  const out = [];
  let guard = 0;
  while (cur <= end && guard++ < 400) {
    const b = bucketOf(cur, group);
    out.push(
      map.get(b.key) || {
        ...b,
        orders: 0,
        units: 0,
        PKR: 0,
        USD: 0,
      },
    );
    if (group === "year") cur = new Date(cur.getFullYear() + 1, 0, 1);
    else if (group === "month")
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    else cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
  return guard >= 400 ? arr : out;
}

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * p;
}
const compact = (n, cur) => {
  const v = Number(n) || 0;
  const s =
    v >= 1e6
      ? (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
      : v >= 1e3
        ? (v / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
        : String(Math.round(v * 100) / 100);
  return cur === "metric" ? s : (cur === "PKR" ? "Rs " : "$") + s;
};

function BarChart({ data, metric, cur }) {
  const [hover, setHover] = useState(null);
  const W = 860;
  const H = 320;
  const L = 64;
  const R = 16;
  const T = 24;
  const B = 62;
  const val = (d) => (metric === "orders" ? d.orders : d[cur]);
  const max = niceMax(Math.max(0, ...data.map(val)));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const iw = W - L - R;
  const ih = H - T - B;
  const slot = iw / Math.max(1, data.length);
  const bw = Math.min(54, slot * 0.66);
  const every = Math.ceil(data.length / 14);
  const fmtV = (n) =>
    metric === "orders" ? `${n} order${n === 1 ? "" : "s"}` : fmtMoney(n, cur);

  if (!data.length || data.every((d) => val(d) === 0))
    return (
      <div className="grid h-64 place-items-center rounded-2xl bg-gold-50 text-sm text-neutral-500">
        Is filter me koi sale nahi mili.
      </div>
    );

  const hd = hover != null ? data[hover] : null;
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Sales graph"
      >
        <defs>
          <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d9bea" />
            <stop offset="100%" stopColor="#17171b" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => {
          const y = T + ih - (t / max) * ih;
          return (
            <g key={i}>
              <line
                x1={L}
                x2={W - R}
                y1={y}
                y2={y}
                stroke="#cfe3fa"
                strokeDasharray={i ? "4 4" : "0"}
              />
              <text
                x={L - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#6b7280"
              >
                {compact(t, metric === "orders" ? "metric" : cur)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const v = val(d);
          const h = (v / max) * ih;
          const cx = L + slot * i + slot / 2;
          const x = cx - bw / 2;
          const y = T + ih - h;
          return (
            <g
              key={d.key}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(i)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={L + slot * i}
                y={T}
                width={slot}
                height={ih}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={bw}
                height={Math.max(h, v > 0 ? 2 : 0)}
                rx="5"
                fill="url(#barGold)"
                opacity={hover == null || hover === i ? 1 : 0.45}
              />
              {data.length <= 12 && v > 0 && (
                <text
                  x={cx}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#17171b"
                >
                  {compact(v, metric === "orders" ? "metric" : cur)}
                </text>
              )}
              {i % every === 0 && (
                <text
                  x={cx}
                  y={H - B + 18}
                  textAnchor={data.length > 8 ? "end" : "middle"}
                  fontSize="10.5"
                  fill="#475569"
                  transform={
                    data.length > 8
                      ? `rotate(-35 ${cx} ${H - B + 18})`
                      : undefined
                  }
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hd && (
        <div className="pointer-events-none absolute right-3 top-2 rounded-2xl border border-gold-200 bg-white/95 px-4 py-3 text-xs shadow-xl">
          <div className="font-bold text-royal">{hd.label}</div>
          <div className="mt-1 text-neutral-600">
            {hd.orders} orders · {hd.units} units
          </div>
          <div className="font-semibold text-royal">{fmtV(val(hd))}</div>
        </div>
      )}
    </div>
  );
}

const sel =
  "w-full rounded-xl border border-gold-200 bg-white px-3 py-2.5 text-sm font-medium text-royal outline-none transition focus:border-gold-500";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gold-600">
        {label}
      </span>
      {children}
    </label>
  );
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export default function AdminSales() {
  const toast = useToast();
  const scope = useAdminScope();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  const [preset, setPreset] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [cur, setCur] = useState(scope.cur || "all"); // admin ki apni currency (PKR ya USD)
  const [statusF, setStatusF] = useState("active"); // active | all | <status>
  const [group, setGroup] = useState("month");
  const [metric, setMetric] = useState("sales");
  const [chartCur, setChartCur] = useState(scope.cur || "PKR");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const [busy, setBusy] = useState(""); // "" | "pdf" | "zip"
  const [prog, setProg] = useState("");

  const load = useCallback(
    async (quiet) => {
      if (!quiet) setLoading(true);
      try {
        const r = await api("/admin/sales");
        setOrders(r.orders || []);
      } catch (e) {
        toast(e.message, "err");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load(false);
    const onVis = () => document.visibilityState === "visible" && load(true);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const years = useMemo(() => {
    const set = new Set(
      (orders || []).map((o) => new Date(o.created_at).getFullYear()),
    );
    set.add(new Date().getFullYear());
    return [...set].filter((y) => !isNaN(y)).sort((a, b) => b - a);
  }, [orders]);

  const applyPreset = (k) => {
    const r = presetRange(k);
    setPreset(k);
    setFrom(r.from);
    setTo(r.to);
    setYear("");
    setMonth("");
  };
  const reset = () => {
    applyPreset("all");
    setCur("all");
    setStatusF("active");
    setSearch("");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders || [])
      .filter((o) => {
        const d = new Date(o.created_at);
        if (isNaN(d)) return false;
        const st = normStatus(o.status);
        if (statusF === "active" && st === "cancelled") return false;
        if (statusF !== "active" && statusF !== "all" && st !== statusF)
          return false;
        if (cur !== "all" && (o.currency === "PKR" ? "PKR" : "USD") !== cur)
          return false;
        if (year && d.getFullYear() !== Number(year)) return false;
        if (month !== "" && d.getMonth() !== Number(month)) return false;
        const day = ymd(d);
        if (from && day < from) return false;
        if (to && day > to) return false;
        if (q) {
          const hay = [
            shortId(o.id),
            o.customer?.name,
            o.email,
            o.customer?.phone,
            o.customer?.city,
          ]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, statusF, cur, year, month, from, to, search]);

  const summary = useMemo(() => {
    const s = {
      orders: filtered.length,
      units: 0,
      PKR: 0,
      USD: 0,
      nPKR: 0,
      nUSD: 0,
    };
    for (const o of filtered) {
      const c = o.currency === "PKR" ? "PKR" : "USD";
      s[c] = round2(s[c] + Number(o.total || 0));
      s["n" + c] += 1;
      for (const it of Array.isArray(o.items) ? o.items : [])
        s.units += Number(it.qty) || 0;
    }
    return s;
  }, [filtered]);

  const buckets = useMemo(() => {
    const map = new Map();
    for (const o of filtered) {
      const b = bucketOf(new Date(o.created_at), group);
      const e = map.get(b.key) || { ...b, orders: 0, units: 0, PKR: 0, USD: 0 };
      const c = o.currency === "PKR" ? "PKR" : "USD";
      e.orders += 1;
      e[c] = round2(e[c] + Number(o.total || 0));
      for (const it of Array.isArray(o.items) ? o.items : [])
        e.units += Number(it.qty) || 0;
      map.set(b.key, e);
    }
    return fillGaps(map, group);
  }, [filtered, group]);

  const effCur = cur !== "all" ? cur : chartCur;
  const best = useMemo(
    () => buckets.reduce((m, b) => (!m || b[effCur] > m[effCur] ? b : m), null),
    [buckets, effCur],
  );

  const exportCsv = () => {
    const head = [
      "Invoice",
      "Date",
      "Month",
      "Year",
      "Customer",
      "Email",
      "Phone",
      "Address",
      "City",
      "Items",
      "Currency",
      "Total",
      "Status",
      "Payment",
      "Payment status",
    ];
    const rows = filtered.map((o) => {
      const d = new Date(o.created_at);
      return [
        "INV-" + shortId(o.id),
        ymd(d),
        MONTHS[d.getMonth()],
        d.getFullYear(),
        o.customer?.name,
        o.email || o.customer?.email,
        o.customer?.phone,
        o.customer?.address,
        o.customer?.city,
        (o.items || []).map((i) => `${i.name} x${i.qty}`).join("; "),
        o.currency,
        o.total,
        normStatus(o.status),
        o.payment_method || "cod",
        o.payment_status || "unpaid",
      ];
    });
    const csv =
      "\uFEFF" +
      [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${ymd(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const fmtDay = (s) => {
    const [y, m, d] = s.split("-");
    return `${d} ${MON_SHORT[Number(m) - 1]} ${y}`;
  };
  const period = (() => {
    if (year && month !== "") return `${MONTHS[Number(month)]} ${year}`;
    if (year) return `Year ${year}`;
    if (month !== "") return `${MONTHS[Number(month)]} (all years)`;
    if (from && to)
      return from === to ? fmtDay(from) : `${fmtDay(from)} to ${fmtDay(to)}`;
    if (from) return `From ${fmtDay(from)}`;
    if (to) return `Up to ${fmtDay(to)}`;
    return "All time";
  })();

  const bulk = async (kind) => {
    if (busy) return;
    if (!filtered.length)
      return toast("Is filter me koi order nahi hai.", "err");
    if (
      filtered.length > 300 &&
      !window.confirm(
        `${filtered.length} invoices ban rahi hain, thora time lag sakta hai. Jari rakhein?`,
      )
    )
      return;
    setBusy(kind);
    setProg("0%");
    try {
      const opts = {
        period,
        onProgress: (d, t) => setProg(`${Math.round((d / t) * 100)}%`),
      };
      const n =
        kind === "pdf"
          ? await downloadBulkInvoices(filtered, opts)
          : await downloadInvoicesZip(filtered, opts);
      toast(`${n} invoices download ho gayin`);
    } catch (e) {
      toast("Invoices nahi ban sakin: " + (e.message || "error"), "err");
    } finally {
      setBusy("");
      setProg("");
    }
  };

  const invoice = (o) => {
    try {
      downloadInvoice(o);
    } catch (e) {
      toast("Invoice nahi ban saki: " + (e.message || "error"), "err");
    }
  };

  if (!orders) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-gold-50" />
        ))}
      </div>
    );
  }

  const avg = (c) => {
    const n = summary["n" + c];
    return n ? summary[c] / n : 0;
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="card-lux p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-3xl font-bold text-royal">
            <BarChart3 size={22} className="text-gold-600" />
            Sales report
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCsv}
              disabled={!filtered.length}
              className="flex items-center gap-2 rounded-full border border-gold-200 px-4 py-2 text-xs font-semibold text-royal transition hover:bg-gold-50 disabled:opacity-40"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => load(false)}
              aria-label="Refresh"
              className="grid h-9 w-9 place-items-center rounded-full border border-gold-200 text-royal transition hover:bg-gold-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${preset === p.key ? "gold-bg border-transparent text-white shadow-md" : "border-gold-200 text-neutral-600 hover:bg-gold-50"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Year">
            <select
              className={sel}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPreset("custom");
                setFrom("");
                setTo("");
              }}
            >
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Month">
            <select
              className={sel}
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setPreset("custom");
                setFrom("");
                setTo("");
              }}
            >
              <option value="">All months</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="From date">
            <input
              type="date"
              className={sel}
              value={from}
              max={to || undefined}
              onChange={(e) => {
                setFrom(e.target.value);
                setPreset("custom");
                setYear("");
                setMonth("");
              }}
            />
          </Field>
          <Field label="To date">
            <input
              type="date"
              className={sel}
              value={to}
              min={from || undefined}
              onChange={(e) => {
                setTo(e.target.value);
                setPreset("custom");
                setYear("");
                setMonth("");
              }}
            />
          </Field>
          <Field label="Market / currency">
            <select className={sel} value={cur} disabled>
              <option value={scope.cur}>
                {scope.market} ({scope.cur}) — {scope.brand}
              </option>
            </select>
          </Field>
          <Field label="Order status">
            <select
              className={sel}
              value={statusF}
              onChange={(e) => setStatusF(e.target.value)}
            >
              <option value="active">All except cancelled</option>
              <option value="all">All incl. cancelled</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)} only
                </option>
              ))}
            </select>
          </Field>
          <Field label="Group graph by">
            <select
              className={sel}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </Field>
          <Field label="Search">
            <input
              className={sel}
              placeholder="Name, email, phone, order #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>
        </div>
        <button
          onClick={reset}
          className="mt-4 text-xs font-semibold text-gold-600 underline-offset-2 hover:underline"
        >
          Reset all filters
        </button>
      </div>

      {/* Bulk invoices */}
      <div className="relative overflow-hidden rounded-[2rem] border border-gold-200 bg-gold-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-display text-2xl font-bold text-royal">
              <FileText size={20} className="text-gold-600" />
              Download all invoices
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Upar jo filter laga hai (<b className="text-royal">{period}</b>)
              us ke <b className="text-royal">{filtered.length}</b> orders ki
              invoices. Din, mahina, saal ya 12 mahine tak — filter badlein aur
              download karein.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => bulk("pdf")}
              disabled={!!busy || !filtered.length}
              className="inline-flex items-center gap-2 rounded-full bg-royal px-5 py-3 text-sm font-semibold text-gold-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              <Download size={16} />
              {busy === "pdf" ? `Preparing… ${prog}` : "Ek PDF me (combined)"}
            </button>
            <button
              onClick={() => bulk("zip")}
              disabled={!!busy || !filtered.length}
              className="inline-flex items-center gap-2 rounded-full border border-royal px-5 py-3 text-sm font-semibold text-royal transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
            >
              <Download size={16} />
              {busy === "zip" ? `Preparing… ${prog}` : "ZIP (alag alag PDFs)"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="relative overflow-hidden rounded-[2rem] bg-royal p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold-500/30 blur-3xl" />
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gold-200">
              <Wallet size={15} /> Sales — {scope.brand}
            </div>
            <div className="gold-text mt-1 font-display text-3xl font-bold">
              {fmtMoney(summary[scope.cur], scope.cur)}
            </div>
            <div className="text-[11px] text-gold-200/80">
              {summary["n" + scope.cur]} orders · avg{" "}
              {fmtMoney(avg(scope.cur), scope.cur)}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gold-200">
              <ShoppingBag size={15} /> Total orders
            </div>
            <div className="mt-1 text-3xl font-extrabold">{summary.orders}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gold-200">
              <Package size={15} /> Units sold
            </div>
            <div className="mt-1 text-3xl font-extrabold">{summary.units}</div>
            {best && best[effCur] > 0 && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-gold-200/80">
                <TrendingUp size={12} /> Best: {best.label}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="card-lux p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-bold text-royal">
            {metric === "orders" ? "Orders" : "Sales"} per {group}
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              ["sales", "Sales"],
              ["orders", "Orders"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${metric === k ? "gold-bg border-transparent text-white" : "border-gold-200 text-neutral-600 hover:bg-gold-50"}`}
              >
                {l}
              </button>
            ))}
            {cur === "all" &&
              metric === "sales" &&
              ["PKR", "USD"].map((c) => (
                <button
                  key={c}
                  onClick={() => setChartCur(c)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${chartCur === c ? "bg-royal text-white" : "border-gold-200 text-neutral-600 hover:bg-gold-50"}`}
                >
                  {c}
                </button>
              ))}
          </div>
        </div>
        <div className="mt-4">
          <BarChart data={buckets} metric={metric} cur={effCur} />
        </div>
      </div>

      {/* Period table */}
      <div>
        <h3 className="font-display text-2xl font-bold text-royal">
          Breakdown by {group}
        </h3>
        <div className="mt-3 overflow-x-auto rounded-3xl border border-gold-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-gold-50 text-xs text-royal">
              <tr>
                <th className="p-4">
                  {group === "day"
                    ? "Date"
                    : group === "month"
                      ? "Month"
                      : "Year"}
                </th>
                <th className="p-4">Orders</th>
                <th className="p-4">Units</th>
                <th className="p-4">Sales ({scope.cur})</th>
              </tr>
            </thead>
            <tbody>
              {[...buckets].reverse().map((b) => (
                <tr key={b.key} className="border-t border-gold-100">
                  <td className="p-4 font-semibold text-royal">{b.label}</td>
                  <td className="p-4">{b.orders}</td>
                  <td className="p-4">{b.units}</td>
                  <td className="p-4">
                    {b[scope.cur] ? fmtMoney(b[scope.cur], scope.cur) : "—"}
                  </td>
                </tr>
              ))}
              {!buckets.length && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-neutral-500">
                    Koi sale nahi mili.
                  </td>
                </tr>
              )}
            </tbody>
            {buckets.length > 0 && (
              <tfoot className="border-t-2 border-gold-200 bg-gold-50 font-bold text-royal">
                <tr>
                  <td className="p-4">Total</td>
                  <td className="p-4">{summary.orders}</td>
                  <td className="p-4">{summary.units}</td>
                  <td className="p-4">
                    {fmtMoney(summary[scope.cur], scope.cur)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Orders + invoices */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="font-display text-2xl font-bold text-royal">
            Orders & invoices
          </h3>
          <p className="text-xs text-neutral-500">
            {filtered.length} orders · invoice PDF download karne ke liye button
            dabayein
          </p>
        </div>
        <div className="mt-3 overflow-x-auto rounded-3xl border border-gold-200">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-gold-50 text-xs text-royal">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Cart</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, limit).map((o) => {
                const st = normStatus(o.status);
                const d = new Date(o.created_at);
                return (
                  <tr key={o.id} className="border-t border-gold-100 align-top">
                    <td className="p-4">
                      <div className="font-semibold text-royal">
                        #{shortId(o.id)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {pad(d.getDate())} {MONTHS[d.getMonth()]}{" "}
                        {d.getFullYear()}
                        <br />
                        {d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{o.customer?.name}</div>
                      <div className="text-xs text-neutral-500">
                        {o.email || o.customer?.email}
                        <br />
                        {o.customer?.phone}
                        <br />
                        {o.customer?.address}, {o.customer?.city}
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      {(o.items || []).map((i) => (
                        <div key={i.id}>
                          {i.name} × {i.qty}
                        </div>
                      ))}
                    </td>
                    <td className="p-4 font-bold">
                      {fmtMoney(o.total, o.currency)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[st] || STATUS_STYLE.pending}`}
                      >
                        {st}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => invoice(o)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-royal px-4 py-2 text-xs font-semibold text-gold-200 transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <FileText size={14} /> Invoice PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-500">
                    Koi order nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > limit && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setLimit((l) => l + 25)}
              className="rounded-full border border-gold-200 px-6 py-2.5 text-sm font-semibold text-royal transition hover:bg-gold-50"
            >
              Show more ({filtered.length - limit} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
