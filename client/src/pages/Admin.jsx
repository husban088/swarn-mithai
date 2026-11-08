import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BadgePercent,
  BarChart3,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  LayoutDashboard,
  Loader,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import Thumb from "../components/Thumb";
import { imagesOf } from "../lib/img";
import AdminSales from "../components/AdminSales";
import AdminSale from "../components/AdminSale";
import { downloadInvoice } from "../lib/invoice";
import { orderMatches } from "../lib/orderSearch";
import { api, json } from "../lib/api";
import {
  CATEGORIES,
  ORDER_STATUSES,
  BANK,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_STYLE,
} from "../config";
import { fmtMoney, normStatus, shortId } from "../lib/format";
import { useShop, useToast } from "../store";
import { useAdminScope } from "../lib/adminScope";
import AdminRegionSwitch from "../components/AdminRegionSwitch";

// Ek product ki row: options hon to chip se option chuno, left wali image us option ki dikhti hai
// (pehla option pehle se active).
function ProductRow({ p, sc, del }) {
  const vars = Array.isArray(p.variants) ? p.variants : [];
  const [k, setK] = useState(0);
  const cur = vars.length ? vars[Math.min(k, vars.length - 1)] : null;
  const imgs = cur
    ? cur.images?.length
      ? cur.images
      : cur.image
        ? [cur.image]
        : imagesOf(p)
    : imagesOf(p);
  const optPrice = (v) => {
    const n = sc.cur === "USD" ? v.price_usd : v.price_pkr;
    return n == null || n === ""
      ? "—"
      : sc.cur === "USD"
        ? `$${Number(n).toFixed(2)}`
        : `Rs ${Number(n).toLocaleString("en-PK")}`;
  };
  return (
    <tr className="border-t border-gold-100 transition hover:bg-gold-50/50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="group h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gold-100 bg-white">
            <Thumb
              key={imgs[0] || "none"}
              p={{
                ...p,
                variants: [],
                images: imgs,
                image_url: imgs[0] || "",
              }}
              w={200}
              zoom={false}
            />
          </div>
          <div>
            <div className="font-semibold text-royal">{p.name}</div>
            <div className="text-xs text-neutral-500">{p.unit}</div>
            {cur && (
              <div className="mt-0.5 text-[11px] text-gold-600">
                {cur.label} · {imgs.length} image{imgs.length === 1 ? "" : "s"}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="p-4">{CATEGORIES[p.category]?.label}</td>
      <td className="p-4">
        {vars.length ? (
          <div className="flex flex-col items-start gap-1.5 text-xs">
            {vars.map((v, i) => (
              <button
                type="button"
                key={v.key || i}
                onClick={() => setK(i)}
                className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-left transition ${i === k ? "border-gold-500 bg-gold-50 shadow-sm" : "border-gold-200 hover:bg-gold-50"}`}
              >
                <span className="text-neutral-500">{v.label}: </span>
                <b className="text-royal">{optPrice(v)}</b>
              </button>
            ))}
          </div>
        ) : sc.cur === "USD" ? (
          p.price_usd != null ? (
            `$${Number(p.price_usd).toFixed(2)}`
          ) : (
            "—"
          )
        ) : p.price_pkr != null ? (
          `Rs ${Number(p.price_pkr).toLocaleString("en-PK")}`
        ) : (
          "—"
        )}
      </td>
      <td className="p-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.in_stock ? "bg-royal-soft text-royal" : "bg-red-50 text-red-700"}`}
        >
          {p.in_stock ? "In stock" : "Out of stock"}
        </span>
        {p.featured && (
          <span className="ml-1.5 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700">
            Bestseller
          </span>
        )}
      </td>
      <td className="p-4">
        <div className="flex justify-end gap-2">
          <Link
            to={`/admin/products/${p.id}/edit`}
            aria-label="Edit"
            title="Edit product"
            className="grid h-9 w-9 place-items-center rounded-full border border-gold-200 text-royal transition duration-300 hover:-translate-y-0.5 hover:scale-110 hover:bg-gold-50 hover:shadow-md"
          >
            <Pencil size={15} />
          </Link>
          <button
            onClick={() => del(p)}
            aria-label="Delete"
            className="grid h-9 w-9 place-items-center rounded-full border border-red-200 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductsTab() {
  const toast = useToast();
  const sc = useAdminScope();
  const { reload } = useShop();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api("/admin/products");
      setRows(r.products);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    load();
  }, [load]);

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/admin/products/${p.id}`, { method: "DELETE" });
      toast("Product deleted");
      load();
      reload();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          {rows.length} {sc.brand} products
        </p>
        <Link to="/admin/products/new" className="btn-gold">
          <Plus size={16} />
          Add product
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-gold-200">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-gold-50 text-xs text-royal">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">
                {sc.cur === "PKR" ? "Price (PKR)" : "Price (USD)"}
              </th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <ProductRow key={p.id} p={p} sc={sc} del={del} />
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-neutral-500">
                  No products yet. Add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STATUS_META = {
  pending: { label: "Pending", icon: Clock },
  processing: { label: "Processing", icon: Loader },
  shipped: { label: "Shipped", icon: Truck },
  delivered: { label: "Delivered", icon: PackageCheck },
  cancelled: { label: "Cancelled", icon: XCircle },
};

// Sirf admin ki apni currency (Pakistan = PKR, USA = USD)
const amounts = (o, cur) => (o[cur] > 0 ? fmtMoney(o[cur], cur) : "—");

function DashboardTab() {
  const toast = useToast();
  const sc = useAdminScope();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (quiet) => {
      if (!quiet) setLoading(true);
      try {
        setS(await api("/admin/stats"));
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
    // Live: har 8 sec baad aur tab/window par wapis aate hi naya data
    const t = setInterval(() => load(true), 8000);
    const onVis = () => document.visibilityState === "visible" && load(true);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [load]);

  if (!s) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-gold-50" />
        ))}
      </div>
    );
  }

  const maxVisitors = Math.max(1, ...s.products.map((p) => p.visitors));

  return (
    <div className="space-y-8">
      {s.warning && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {s.warning}
        </div>
      )}

      {/* Earnings */}
      <div className="relative overflow-hidden rounded-[2rem] bg-royal p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold-500/30 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gold-200">
              <Wallet size={18} />
              Total earning (delivered orders)
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
              <div>
                <div className="gold-text font-display text-5xl font-bold sm:text-6xl">
                  {fmtMoney(s.earnings[sc.cur], sc.cur)}
                </div>
                <div className="text-xs text-gold-200/80">
                  {sc.brand} · {sc.market} ({sc.cur})
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => load(false)}
            aria-label="Refresh"
            className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-gold-100 transition hover:bg-white/10"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gold-200">
              <ClipboardList size={15} />
              Total orders
            </div>
            <div className="mt-1 text-2xl font-extrabold">{s.totalOrders}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gold-200">
              <TrendingUp size={15} />
              Expected (pending + processing + shipped)
            </div>
            <div className="mt-1 text-lg font-extrabold">
              {amounts(s.upcoming, sc.cur)}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gold-200">
              <Eye size={15} />
              Total product views
            </div>
            <div className="mt-1 text-2xl font-extrabold">{s.totalViews}</div>
          </div>
        </div>
      </div>

      {/* Order status cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ORDER_STATUSES.map((k) => {
          const m = STATUS_META[k];
          const b = s.byStatus[k];
          const Icon = m.icon;
          return (
            <div key={k} className="card-lux p-5">
              <div className="flex items-center justify-between">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full ${STATUS_STYLE[k]}`}
                >
                  <Icon size={18} />
                </span>
                <span className="text-3xl font-extrabold text-royal">
                  {b.count}
                </span>
              </div>
              <div className="mt-3 text-sm font-semibold text-royal">
                {m.label} orders
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                {amounts(b, sc.cur)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product traffic */}
      <div>
        <h2 className="flex items-center gap-2 font-display text-3xl font-bold text-royal">
          <Users size={22} className="text-gold-600" />
          Product visitors
          <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-600">
            <span className="live-dot" /> Live
          </span>
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          {sc.brand}: kis product par kitne log aaye (unique visitors), kitni
          dafa dekha gaya, aur kitne order/units bike.
        </p>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-gold-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gold-50 text-xs text-royal">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Visitors</th>
                <th className="p-4">Views</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Units sold</th>
              </tr>
            </thead>
            <tbody>
              {s.products.map((p) => (
                <tr key={p.id} className="border-t border-gold-100">
                  <td className="p-4">
                    <div className="font-semibold text-royal">{p.name}</div>
                    <div className="text-xs text-neutral-500">
                      {CATEGORIES[p.category]?.label}
                    </div>
                    {(p.boxes || []).length > 0 && (
                      <div className="mt-1 text-[11px] font-semibold text-gold-700">
                        {p.boxes
                          .map((b) => `${b.label} × ${b.units}`)
                          .join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 font-bold text-royal">
                        {p.visitors}
                      </span>
                      <div className="h-2 w-40 overflow-hidden rounded-full bg-gold-100">
                        <div
                          className="gold-bg h-full origin-left rounded-full transition-all duration-700"
                          style={{
                            width: `${(p.visitors / maxVisitors) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{p.views}</td>
                  <td className="p-4">{p.orders}</td>
                  <td className="p-4 font-semibold">{p.units}</td>
                </tr>
              ))}
              {s.products.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-neutral-500">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setRows((await api("/admin/orders")).orders);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    load();
  }, [load]);

  const status = async (id, s) => {
    try {
      await api(`/admin/orders/${id}`, json("PATCH", { status: s }));
      toast("Status updated");
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  };

  const invoice = (o) => {
    try {
      downloadInvoice(o);
    } catch (e) {
      toast("Invoice nahi ban saki: " + (e.message || "error"), "err");
    }
  };

  // Search: order #, customer name, email, phone (USA + Pakistan dono)
  const searched = search.trim()
    ? rows.filter((o) => orderMatches(o, search))
    : rows;
  const counts = searched.reduce((m, o) => {
    const k = normStatus(o.status);
    m[k] = (m[k] || 0) + 1;
    return m;
  }, {});
  const list =
    filter === "all"
      ? searched
      : searched.filter((o) => normStatus(o.status) === filter);

  return (
    <div>
      <div className="relative mb-4 max-w-xl">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, customer name, email or phone"
          className="w-full rounded-full border border-gold-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-neutral-500 transition hover:bg-gold-50"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize transition ${filter === k ? "gold-bg border-transparent text-white shadow-md" : "border-gold-200 text-neutral-600 hover:bg-gold-50"}`}
          >
            {k} ({k === "all" ? searched.length : counts[k] || 0})
          </button>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-gold-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gold-50 text-xs text-royal">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            )}
            {list.map((o) => {
              const st = normStatus(o.status);
              return (
                <tr key={o.id} className="border-t border-gold-100 align-top">
                  <td className="p-4">
                    <div className="font-semibold text-royal">
                      #{shortId(o.id)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {new Date(o.created_at).toLocaleString()} · {o.country}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{o.customer?.name}</div>
                    <div className="text-xs text-neutral-500">
                      {o.email}
                      <br />
                      {o.customer?.phone}
                      <br />
                      {o.customer?.address}, {o.customer?.city}
                    </div>
                  </td>
                  <td className="p-4 text-xs">
                    {(o.items || []).map((i) => (
                      <div key={`${i.id}~${i.variant || ""}`}>
                        {i.name} × {i.qty}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-bold">
                    {fmtMoney(o.total, o.currency)}
                    <div className="mt-1 text-[11px] font-semibold text-neutral-500">
                      {PAYMENT_LABELS[o.payment_method] || "Cash on delivery"}
                      {" · "}
                      {PAYMENT_STATUS_LABELS[o.payment_status] ||
                        "Pay on delivery"}
                    </div>
                    {o.payment_method === "bank" && (
                      <div className="mt-2 w-44 rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-[11px] font-semibold leading-snug text-emerald-800">
                        Customer sent a Citibank payment receipt. Marked as
                        paid.
                        {o.receipt_url ? (
                          <a
                            href={o.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1.5 block"
                            title="Open receipt"
                          >
                            <img
                              src={o.receipt_url}
                              alt="Payment receipt"
                              loading="lazy"
                              className="h-28 w-full rounded-lg border border-emerald-200 bg-white object-cover object-top"
                            />
                            <span className="mt-1 block underline">
                              View full receipt
                            </span>
                          </a>
                        ) : (
                          <span className="mt-1 block text-red-700">
                            Receipt image missing.
                          </span>
                        )}
                        <span className="mt-1 block font-normal text-emerald-900/80">
                          Check it shows Citibank, account {BANK.account} and
                          the owner name. If not, set the order to cancelled.
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[st] || STATUS_STYLE.pending}`}
                    >
                      {st}
                    </span>
                    <select
                      value={st}
                      onChange={(e) => status(o.id, e.target.value)}
                      className="block rounded-lg border border-gold-200 bg-white px-2 py-1.5 text-xs font-semibold"
                    >
                      {ORDER_STATUSES.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
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
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-neutral-500">
                  {search.trim()
                    ? "Is search se koi order nahi mila."
                    : "No orders here."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "sales", label: "Sales", icon: BarChart3 },
  { key: "offers", label: "Sale offers", icon: BadgePercent },
];

export default function Admin() {
  const sc = useAdminScope();
  const [params, setParams] = useSearchParams();
  const t = params.get("tab");
  const tab = TABS.some((x) => x.key === t) ? t : "dashboard";
  const setTab = (k) => setParams(k === "dashboard" ? {} : { tab: k });
  // Purana session (adminScope abhi aaya nahi): server se /auth/me aane tak intezar
  if (!sc.ready)
    return (
      <div className="container-x py-12">
        <div className="h-24 animate-pulse rounded-3xl bg-gold-50" />
      </div>
    );
  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-5">
          {sc.mark ? (
            <img
              src={sc.mark}
              alt={sc.brand}
              className="h-14 w-14 shrink-0 object-contain transition duration-500 hover:-translate-y-1 sm:h-20 sm:w-20"
              draggable="false"
            />
          ) : (
            <span className="grid shrink-0 place-items-center rounded-3xl border border-gold-200 bg-white p-3 shadow-lg shadow-slate-900/10 transition duration-500 hover:-translate-y-1 hover:shadow-xl">
              <img
                src={sc.logo}
                alt={sc.brand}
                className="h-16 w-auto object-contain sm:h-20"
                draggable="false"
              />
            </span>
          )}
          <div>
            <h1 className="font-display text-4xl font-bold text-royal sm:text-5xl">
              {sc.brand} admin
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Signed in as {sc.email} · {sc.market} ({sc.cur})
            </p>
          </div>
        </div>
        <AdminRegionSwitch />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${tab === key ? "gold-bg border-transparent text-white shadow-md" : "border-gold-200 text-neutral-600 hover:bg-gold-50"}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6" key={sc.country}>
        {tab === "dashboard" ? (
          <DashboardTab />
        ) : tab === "products" ? (
          <ProductsTab />
        ) : tab === "sales" ? (
          <AdminSales />
        ) : tab === "offers" ? (
          <AdminSale />
        ) : (
          <OrdersTab />
        )}
      </div>
    </div>
  );
}
