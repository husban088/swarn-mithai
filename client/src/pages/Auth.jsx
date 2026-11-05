import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/Logo";
import PasswordInput from "../components/PasswordInput";
import FieldError, { errCls } from "../components/FieldError";
import { vConfirm, vEmail, vName, vPassword, vPhone } from "../lib/validate";
import { useAuth, useGeo, useToast } from "../store";
import { brandFor } from "../config";

function Shell({ title, sub, children, footer }) {
  const { country } = useGeo();
  const brandName = brandFor(country?.code).name;
  return (
    <div className="container-x grid min-h-[75vh] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="relative hidden h-full min-h-[520px] overflow-hidden rounded-[2rem] bg-royal p-12 text-gold-100 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full border border-gold-400/40" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full border border-gold-400/30" />
        <BrandMark size={100} />
        <div>
          <h2 className="font-display text-5xl font-bold leading-tight text-gold-200">
            Welcome to {brandName},
            <br />
            delivered to your door.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-gold-100/80">
            Create an account to place orders and get confirmation emails for
            every purchase.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md animate-rise">
        <h1 className="font-display text-5xl font-bold text-royal">{title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{sub}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-sm text-neutral-600">{footer}</p>
      </div>
    </div>
  );
}

const focusFirst = (ids) => {
  const id = ids.find(Boolean);
  if (id) document.getElementById(id)?.focus();
};

export function SignIn() {
  const { signin } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [busy, setBusy] = useState(false);

  const errs = {
    email: vEmail(f.email),
    password: f.password ? "" : "Please enter your password.",
  };
  // Foran dikhao: jab type kiya ho, field se bahar gaye hon ya submit dabaya ho
  const show = (k) => submitted || touched[k] || f[k].length > 0;
  const msg = (k) => (show(k) ? errs[k] : "");
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const change = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setServerErr("");
  };
  const pwMsg = msg("password") || serverErr;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (errs.email || errs.password) {
      focusFirst([errs.email && "email", errs.password && "pw"]);
      return;
    }
    setBusy(true);
    try {
      const u = await signin(f.email.trim(), f.password);
      toast(`Welcome back, ${u.name}`);
      nav(loc.state?.from || (u.isAdmin ? "/admin" : "/"), { replace: true });
    } catch (err) {
      if (/email|password/i.test(err.message)) setServerErr(err.message);
      else toast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title="Sign in"
      sub="Welcome back. Enter your details to continue."
      footer={
        <>
          New here?{" "}
          <Link
            to="/signup"
            className="font-semibold text-gold-600 hover:text-royal"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`field ${errCls(msg("email"))}`}
            value={f.email}
            onChange={change("email")}
            onBlur={blur("email")}
            aria-invalid={msg("email") ? "true" : undefined}
          />
          <FieldError msg={msg("email")} />
        </div>
        <div>
          <label className="label" htmlFor="pw">
            Password
          </label>
          <PasswordInput
            id="pw"
            autoComplete="current-password"
            value={f.password}
            onChange={change("password")}
            onBlur={blur("password")}
            error={!!pwMsg}
          />
          <FieldError msg={pwMsg} />
        </div>
        <button disabled={busy} className="btn-gold w-full !py-3.5">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </Shell>
  );
}

export function SignUp() {
  const { signup } = useAuth();
  const { country } = useGeo();
  const toast = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState({});
  const [busy, setBusy] = useState(false);

  const errs = {
    name: vName(f.name),
    email: vEmail(f.email),
    phone: vPhone(f.phone, false),
    password: vPassword(f.password),
    confirmPassword: vConfirm(f.password, f.confirmPassword),
  };
  const show = (k) => submitted || touched[k] || (f[k] || "").length > 0;
  const msg = (k) =>
    show(k) ? errs[k] || serverErr[k] || "" : serverErr[k] || "";
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const change = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setServerErr((s) => (s[k] ? { ...s, [k]: "" } : s));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const order = [
      ["name", "name"],
      ["email", "email"],
      ["phone", "phone"],
      ["password", "pw"],
      ["confirmPassword", "cpw"],
    ];
    const bad = order.filter(([k]) => errs[k]);
    if (bad.length) {
      focusFirst([bad[0][1]]);
      return;
    }
    setBusy(true);
    try {
      const u = await signup({
        ...f,
        name: f.name.trim(),
        email: f.email.trim(),
        country: country?.code,
      });
      toast(`Account created. Welcome, ${u.name}`);
      nav(u.isAdmin ? "/admin" : "/", { replace: true });
    } catch (err) {
      const m = err.message || "";
      if (/already|registered|email/i.test(m)) setServerErr({ email: m });
      else if (/confirm|match/i.test(m)) setServerErr({ confirmPassword: m });
      else if (/password/i.test(m)) setServerErr({ password: m });
      else if (/name/i.test(m)) setServerErr({ name: m });
      else toast(m, "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title="Create account"
      sub="Order in a few clicks."
      footer={
        <>
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-gold-600 hover:text-royal"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            autoComplete="name"
            className={`field ${errCls(msg("name"))}`}
            value={f.name}
            onChange={change("name")}
            onBlur={blur("name")}
            aria-invalid={msg("name") ? "true" : undefined}
          />
          <FieldError msg={msg("name")} />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`field ${errCls(msg("email"))}`}
            value={f.email}
            onChange={change("email")}
            onBlur={blur("email")}
            aria-invalid={msg("email") ? "true" : undefined}
          />
          <FieldError msg={msg("email")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">
              Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={`field ${errCls(msg("phone"))}`}
              value={f.phone}
              onChange={change("phone")}
              onBlur={blur("phone")}
              aria-invalid={msg("phone") ? "true" : undefined}
            />
            <FieldError msg={msg("phone")} />
          </div>
          <div>
            <label className="label" htmlFor="city">
              City (optional)
            </label>
            <input
              id="city"
              autoComplete="address-level2"
              className="field"
              value={f.city}
              onChange={change("city")}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="addr">
            Address (optional)
          </label>
          <input
            id="addr"
            autoComplete="street-address"
            className="field"
            value={f.address}
            onChange={change("address")}
          />
        </div>
        <div>
          <label className="label" htmlFor="pw">
            Password
          </label>
          <PasswordInput
            id="pw"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={f.password}
            onChange={change("password")}
            onBlur={blur("password")}
            error={!!msg("password")}
          />
          <FieldError msg={msg("password")} />
        </div>
        <div>
          <label className="label" htmlFor="cpw">
            Confirm password
          </label>
          <PasswordInput
            id="cpw"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={f.confirmPassword}
            onChange={change("confirmPassword")}
            onBlur={blur("confirmPassword")}
            error={!!msg("confirmPassword")}
          />
          <FieldError msg={msg("confirmPassword")} />
        </div>
        <button disabled={busy} className="btn-gold w-full !py-3.5">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </Shell>
  );
}
