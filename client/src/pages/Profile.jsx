import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { fmtDate, fmtMoney, normStatus, shortId } from "../lib/format";
import { PAYMENT_LABELS, STATUS_STYLE } from "../config";
import { useAuth, useToast } from "../store";

const STEPS = ["pending", "processing", "shipped", "delivered"];

function Progress({ status }) {
  if (status === "cancelled")
    return (
      <p className="text-xs font-semibold text-red-600">
        This order was cancelled.
      </p>
    );
  const at = Math.max(0, STEPS.indexOf(status));
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col gap-1">
          <div
            className={`h-1.5 rounded-full transition-all ${i <= at ? "gold-bg" : "bg-gold-100"}`}
          />
          <span
            className={`text-[10px] font-semibold capitalize ${i <= at ? "text-royal" : "text-neutral-400"}`}
          >
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="card-lux p-5">
      <Icon size={20} className="text-gold-600" />
      <div className="mt-3 text-2xl font-extrabold text-royal">{value}</div>
      <div className="text-xs font-medium text-neutral-500">{label}</div>
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile, signout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false); // form tab tak band jab tak "Edit profile" na dabayein
  const [f, setF] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
  });

  // Server se taaza profile aane par form bhi update ho
  useEffect(() => {
    setF({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
    });
  }, [user?.name, user?.phone, user?.address, user?.city]);

  const load = useCallback(async () => {
    try {
      setOrders((await api("/orders/mine")).orders);
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const spent = { PKR: 0, USD: 0 };
    let delivered = 0;
    for (const o of orders) {
      const s = normStatus(o.status);
      if (s === "delivered") delivered += 1;
      if (s !== "cancelled")
        spent[o.currency === "PKR" ? "PKR" : "USD"] += Number(o.total) || 0;
    }
    const parts = [
      spent.PKR > 0 && fmtMoney(spent.PKR, "PKR"),
      spent.USD > 0 && fmtMoney(spent.USD, "USD"),
    ].filter(Boolean);
    return { delivered, spent: parts.length ? parts.join(" + ") : "—" };
  }, [orders]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return toast("Enter your name.", "err");
    setBusy(true);
    try {
      await updateProfile(f);
      toast("Profile updated");
      setEditing(false);
    } catch (err) {
      toast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const fromUser = () => ({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
  });
  // Edit khol / band: band karne par badlav wapas (cancel)
  const toggleEdit = () => {
    if (editing) setF(fromUser());
    setEditing((v) => !v);
  };

  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="container-x py-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-royal p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-2 border-gold-300/60 bg-gradient-to-br from-gold-500 to-gold-700 font-display text-5xl font-bold shadow-xl shadow-gold-500/40">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-4xl font-bold sm:text-5xl">
                {user.name}
              </h1>
              <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-gold-100">
                {user.isAdmin ? "Administrator" : "Customer"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gold-100/90">
              <span className="flex items-center gap-2">
                <Mail size={15} />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-2">
                  <Phone size={15} />
                  {user.phone}
                </span>
              )}
              {(user.city || user.address) && (
                <span className="flex items-center gap-2">
                  <MapPin size={15} />
                  {[user.address, user.city].filter(Boolean).join(", ")}
                </span>
              )}
              {user.createdAt && (
                <span className="flex items-center gap-2">
                  <CalendarDays size={15} />
                  Member since {fmtDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.isAdmin && (
              <Link to="/admin" className="btn-line !py-2.5">
                <ShieldCheck size={16} />
                Admin panel
              </Link>
            )}
            <button
              onClick={() => {
                signout();
                nav("/");
              }}
              className="btn glass !py-2.5 text-white hover:bg-white/10"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={ShoppingBag} label="Total orders" value={orders.length} />
        <Stat icon={Package} label="Delivered" value={stats.delivered} />
        <Stat
          icon={ShieldCheck}
          label="Total spent (excl. cancelled)"
          value={stats.spent}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* My details: pehle sirf details, "Edit profile" par form khulta hai */}
        <div className="card-lux h-fit space-y-4 p-5 hover:translate-y-0 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-3xl font-bold text-royal">
              <UserRound size={22} className="text-gold-600" />
              My details
            </h2>
            <button
              type="button"
              onClick={toggleEdit}
              aria-expanded={editing}
              className={editing ? "btn-line !py-2.5" : "btn-gold !py-2.5"}
            >
              {editing ? <X size={16} /> : <Pencil size={16} />}
              {editing ? "Cancel edit" : "Edit profile"}
            </button>
          </div>

          {!editing && (
            <dl className="divide-y divide-gold-100 text-sm">
              {[
                ["Full name", user.name],
                ["Email", user.email],
                ["Phone", user.phone],
                ["City", user.city],
                ["Delivery address", user.address],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {k}
                  </dt>
                  <dd className="break-words font-medium text-royal sm:max-w-[65%] sm:text-right">
                    {v || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {editing && (
            <form onSubmit={save} className="animate-fadeUp space-y-4">
              <div>
                <label className="label" htmlFor="p-name">
                  Full name
                </label>
                <input
                  id="p-name"
                  className="field"
                  value={f.name}
                  onChange={set("name")}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="p-email">
                  Email
                </label>
                <input
                  id="p-email"
                  className="field bg-gold-50 text-neutral-500"
                  value={user.email}
                  disabled
                />
              </div>
              <div>
                <label className="label" htmlFor="p-phone">
                  Phone
                </label>
                <input
                  id="p-phone"
                  type="tel"
                  className="field"
                  value={f.phone}
                  onChange={set("phone")}
                />
              </div>
              <div>
                <label className="label" htmlFor="p-city">
                  City
                </label>
                <input
                  id="p-city"
                  className="field"
                  value={f.city}
                  onChange={set("city")}
                />
              </div>
              <div>
                <label className="label" htmlFor="p-addr">
                  Delivery address
                </label>
                <textarea
                  id="p-addr"
                  rows={2}
                  className="field"
                  value={f.address}
                  onChange={set("address")}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button disabled={busy} className="btn-gold flex-1 !py-3.5">
                  {busy ? "Updating…" : "Update profile"}
                </button>
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="btn-line !py-3.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Orders */}
        <div>
          <h2 className="font-display text-3xl font-bold text-royal">
            My orders
          </h2>
          <div className="mt-4 space-y-4">
            {loading &&
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-3xl bg-gold-50"
                />
              ))}
            {!loading && orders.length === 0 && (
              <div className="card-lux grid place-items-center p-10 text-center hover:translate-y-0">
                <ShoppingBag size={40} className="text-gold-400" />
                <p className="mt-3 font-display text-2xl font-bold text-royal">
                  No orders yet
                </p>
                <Link to="/shop" className="btn-gold mt-5">
                  Start shopping
                </Link>
              </div>
            )}
            {orders.map((o) => {
              const s = normStatus(o.status);
              return (
                <div key={o.id} className="card-lux p-5 hover:translate-y-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-royal">
                        #{shortId(o.id)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {fmtDate(o.created_at)}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[s] || STATUS_STYLE.pending}`}
                    >
                      {s}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-neutral-700">
                    {(o.items || []).map((i) => (
                      <div
                        key={`${i.id}~${i.variant || ""}`}
                        className="flex justify-between gap-3"
                      >
                        <span>
                          {i.name} × {i.qty}
                        </span>
                        <span className="font-medium">
                          {fmtMoney(i.price * i.qty, o.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between border-t border-gold-100 pt-3 text-sm font-extrabold text-royal">
                    <span>Total</span>
                    <span>{fmtMoney(o.total, o.currency)}</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    Deliver to: {o.customer?.address}, {o.customer?.city}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Payment:{" "}
                    {PAYMENT_LABELS[o.payment_method] || "Cash on delivery"}
                    {o.payment_status === "paid" ? " · Paid" : ""}
                  </p>
                  <Link
                    to={`/order-placed/${o.id}`}
                    className="mt-2 inline-block text-xs font-bold text-champ-600 underline"
                  >
                    View order details
                  </Link>
                  <div className="mt-4">
                    <Progress status={s} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
