import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Lock, ShieldCheck, X } from "lucide-react";
import { api, json } from "../lib/api";
import { setAdminView } from "../lib/adminView";
import { useAdminScope } from "../lib/adminScope";
import { useToast } from "../store";
import PasswordInput from "./PasswordInput";

const REGIONS = {
  PK: {
    flag: "🇵🇰",
    label: "Pakistan",
    brand: "Evelyn One",
    logo: "/brand/evelyn-one-mark.svg",
    bare: true,
  },
  US: {
    flag: "🇺🇸",
    label: "USA",
    brand: "Mithai House",
    logo: "/brand/mithai-house.png",
  },
};

// Sirf super admin (wjahattahir@gmail.com) ko dikhta hai.
// Region chunne par us region ke admin ki email + password poochta hai, phir uska poora admin page khulta hai.
export default function AdminRegionSwitch() {
  const sc = useAdminScope();
  const toast = useToast();
  const [target, setTarget] = useState(null);
  if (!sc.ready || !sc.isSuper) return null;
  return (
    <div className="w-full sm:w-auto">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-gold-600">
        Admin region
      </span>
      <label className="relative flex items-center rounded-2xl border border-gold-200 bg-white shadow-sm transition duration-300 hover:border-gold-500 hover:shadow-lg">
        <span className="sr-only">Choose admin region</span>
        <select
          value={sc.country}
          onChange={(e) => setTarget(e.target.value)}
          aria-label="Choose admin region"
          className="w-full cursor-pointer appearance-none rounded-2xl bg-transparent py-3 pl-4 pr-10 text-sm font-semibold text-royal outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:min-w-[240px]"
        >
          {Object.entries(REGIONS).map(([code, r]) => (
            <option key={code} value={code}>
              {r.flag} {r.label} · {r.brand}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 text-neutral-500"
        />
      </label>
      {target && (
        <LoginModal
          region={target}
          onClose={() => setTarget(null)}
          onDone={() => {
            toast(`${REGIONS[target].brand} admin khul gaya`);
            setTarget(null);
          }}
        />
      )}
    </div>
  );
}

function LoginModal({ region, onClose, onDone }) {
  const R = REGIONS[region];
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const first = useRef(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [busy, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !pw) return setErr("Email aur password dono likhein.");
    setBusy(true);
    setErr("");
    try {
      const r = await api(
        "/auth/signin",
        json("POST", { email: email.trim(), password: pw }),
      );
      if (!r.user?.isAdmin || r.user.adminScope?.country !== region) {
        setErr(`Ye account ${R.label} (${R.brand}) ka admin nahi hai.`);
        return;
      }
      setAdminView({
        region,
        token: r.token,
        refresh: r.refresh,
        user: r.user,
      });
      onDone();
    } catch (ex) {
      setErr(ex.message || "Login nahi ho saka.");
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[#060607]/70 p-4 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`${R.label} admin login`}
    >
      <form
        onSubmit={submit}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-champ-200 bg-white shadow-2xl"
      >
        <div className="relative bg-gradient-to-br from-[#060607] via-[#0a3a78] to-[#1d7fe0] px-6 pb-6 pt-7 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/25"
          >
            <X size={16} />
          </button>
          <div className="relative flex items-center gap-4">
            <span
              className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl ${R.bare ? "" : "bg-white p-1.5 shadow-lg"}`}
            >
              <img
                src={R.logo}
                alt={R.brand}
                className="h-full w-full object-contain"
              />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                {R.flag} {R.label} admin
              </div>
              <h3 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
                {R.brand}
              </h3>
            </div>
          </div>
          <p className="relative mt-4 flex items-start gap-2 text-sm text-white/80">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            {R.brand} ka admin page kholne ke liye is region ke admin ki login
            details dalein.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="label" htmlFor="ars-email">
              Admin email
            </label>
            <input
              id="ars-email"
              ref={first}
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="ars-pw">
              Password
            </label>
            <PasswordInput
              id="ars-pw"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
              error={!!err}
            />
          </div>
          {err && (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700"
            >
              {err}
            </p>
          )}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn-line w-full justify-center !py-3.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-gold w-full justify-center !py-3.5 disabled:opacity-60"
            >
              <Lock size={15} />
              {busy ? "Checking…" : `Open ${R.brand}`}
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
