import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  API_BASE,
  api,
  clearSession,
  getSession,
  json,
  setSession,
  trackProductView,
} from "./lib/api";
import {
  COUNTRIES,
  COUNTRY_SWITCH_EMAILS,
  SITE_COUNTRY,
  money,
} from "./config";
import { lineKey, pickVariant, variantsOf, viewOf } from "./lib/variants";
import { onBootCode, takeBootResult } from "./lib/geoBoot";

/* ------------------------------------------------------------------ */
/* Country detection (IP based, VPN friendly)                          */
/* ------------------------------------------------------------------ */
function timeoutFetch(url, ms = 3500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  const sep = url.includes("?") ? "&" : "?";
  // Cache-bust: VPN badalne ke baad purana jawab kabhi na mile
  return fetch(`${url}${sep}_=${Date.now()}`, {
    signal: ctrl.signal,
    cache: "no-store",
  }).finally(() => clearTimeout(t));
}

// Har source browser ke apne IP ko dekhta hai (VPN ke saath bhi sahi). Sab ek saath chalte hain
// aur jab 2 source ek hi country batayein foran wahi use hoti hai (galat/purana jawab out-vote ho jata hai).
const IP_SOURCES = [
  async () => {
    const d = await (await timeoutFetch("https://ipwho.is/")).json();
    if (!d.country_code) throw 0;
    return d.country_code;
  },
  async () => {
    const d = await (await timeoutFetch("https://api.country.is/")).json();
    if (!d.country) throw 0;
    return d.country;
  },
  async () => {
    const d = await (
      await timeoutFetch("https://get.geojs.io/v1/ip/country.json")
    ).json();
    if (!d.country) throw 0;
    return d.country;
  },
  async () => {
    const d = await (await timeoutFetch("https://ipapi.co/json/")).json();
    if (!d.country_code) throw 0;
    return d.country_code;
  },
  async () => {
    const d = await (await timeoutFetch("https://api.ip.sb/geoip")).json();
    if (!d.country_code) throw 0;
    return d.country_code;
  },
  async () => {
    const t = await (
      await timeoutFetch("https://www.cloudflare.com/cdn-cgi/trace")
    ).text();
    const m = t.match(/loc=([A-Z]{2})/);
    if (!m) throw 0;
    return m[1];
  },
  // Apna server (AdBlock/Brave block nahi karte). Deploy par host ke headers se foran sahi aata hai.
  async () => {
    const d = await (await timeoutFetch(`${API_BASE}/api/geo`, 5000)).json();
    if (!d.country) throw 0;
    return d.country;
  },
];

function detectCountry() {
  const forced = new URLSearchParams(window.location.search).get("country");
  if (forced && COUNTRIES[forced.toUpperCase()])
    return Promise.resolve(COUNTRIES[forced.toUpperCase()].code);
  const tzGuess = () =>
    (Intl.DateTimeFormat().resolvedOptions().timeZone || "") === "Asia/Karachi"
      ? "PK"
      : "US";
  // Pehli baar: index.html ki boot script ne jo asli IP country nikali wahi lo (dobara network call nahi)
  return takeBootResult().then((boot) => {
    if (boot) return boot;
    return detectByVotes(tzGuess);
  });
}

function detectByVotes(tzGuess) {
  return new Promise((resolve) => {
    const votes = { PK: 0, US: 0 };
    let total = 0;
    let pending = IP_SOURCES.length;
    let done = false;
    let timer = null;
    const finish = (code) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearTimeout(hard);
      if (code) return resolve(code);
      if (votes.PK === votes.US) return resolve(total ? "US" : tzGuess());
      resolve(votes.PK > votes.US ? "PK" : "US");
    };
    const hard = setTimeout(() => finish(), 6000);
    // Pehle 3 source foran, baqi thori der baad aur sirf tab jab abhi tak faisla na hua ho
    const DELAYS = [0, 0, 0, 1200, 1200, 1800, 1800];
    IP_SOURCES.forEach((f, idx) =>
      new Promise((res, rej) => {
        const go = () => (done ? rej(0) : f().then(res, rej));
        if (DELAYS[idx]) setTimeout(go, DELAYS[idx]);
        else go();
      })
        .then((c) => {
          const k = String(c).toUpperCase() === "PK" ? "PK" : "US";
          votes[k] += 1;
          total += 1;
          if (votes[k] >= 2) return finish(k);
          // Pehla jawab aate hi chhota intezar, taake koi dusra source contradict kar sake
          if (!timer) timer = setTimeout(() => finish(), 900);
        })
        .catch(() => {})
        .finally(() => {
          pending -= 1;
          if (pending === 0) finish();
        }),
    );
  });
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, type = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, msg, type }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-pop rounded-full px-5 py-2.5 text-sm font-semibold shadow-xl ${t.type === "err" ? "bg-red-600 text-white" : "bg-royal text-gold-200"}`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Geo                                                                 */
/* ------------------------------------------------------------------ */
const GeoCtx = createContext(null);
export const useGeo = () => useContext(GeoCtx);

function GeoProvider({ children }) {
  const { user } = useAuth();
  // Pichli detected country se foran page dikhao, phir background me verify karo
  const [code, setCode] = useState(() => {
    if (SITE_COUNTRY) return SITE_COUNTRY; // alag link: country fix hai
    // Purani saved country par bharosa nahi (VPN badal chuka ho sakta hai): sirf boot script ki pakki country.
    const g = window.__geo;
    return g && g.real && COUNTRIES[g.code] ? g.code : null;
  });
  const busy = useRef(false);

  // Sirf wjahattahir@gmail.com (config.js: COUNTRY_SWITCH_EMAILS): country dropdown se Pakistan / USA chun sakta hai
  // Alag link (VITE_SITE_COUNTRY) par dropdown nahi hota, country fix rehti hai
  const canSwitch =
    !SITE_COUNTRY &&
    COUNTRY_SWITCH_EMAILS.includes(String(user?.email || "").toLowerCase());
  const [override, setOverrideState] = useState(() => {
    try {
      const c = localStorage.getItem("swarn_country_override");
      return COUNTRIES[c] ? c : null;
    } catch {
      return null;
    }
  });
  const setOverride = useCallback((c) => {
    const v = COUNTRIES[c] ? c : null;
    try {
      if (v) localStorage.setItem("swarn_country_override", v);
      else localStorage.removeItem("swarn_country_override");
    } catch {
      /* ignore */
    }
    setOverrideState(v);
  }, []);

  const codeRef = useRef(code);
  const lastRun = useRef(0);
  const refresh = useCallback(async () => {
    if (SITE_COUNTRY) return; // country fix hai, IP se pehchanne ki zaroorat nahi
    if (busy.current) return;
    if (Date.now() - lastRun.current < 8000) return; // focus + visibility ek saath fire hon to dohra kaam nahi
    lastRun.current = Date.now();
    busy.current = true;
    const c = await detectCountry();
    busy.current = false;
    // Detect hui country USA ho (USA VPN on) ya detected country badal jaye (VPN on/off): admin ka manual
    // dropdown choice hata do, website + dropdown detect hui country par aa jayen.
    // Pakistan detect ho aur admin ne dropdown se USA chuna ho to USA hi rehta hai (wapis Pakistan nahi hota).
    if (c === "US" || (codeRef.current && codeRef.current !== c))
      setOverride(null);
    codeRef.current = c;
    try {
      localStorage.setItem("swarn_country", c);
    } catch {
      /* ignore */
    }
    setCode((prev) => (prev === c ? prev : c));
  }, [setOverride]);

  useEffect(() => {
    refresh();
    // VPN badalne par foran update: tab focus par aur har 20 sec baad dobara check
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    const t = setInterval(
      () => document.visibilityState === "visible" && refresh(),
      30000,
    );
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      clearInterval(t);
    };
  }, [refresh]);

  // Agar IP detect na ho paye (internet/block): boot script 3.5 sec baad pichli country ya timezone se site khol deti hai.
  // Detect hote hi (background me) sahi country lag jati hai.
  useEffect(() => {
    if (code || SITE_COUNTRY) return;
    return onBootCode((c) => setCode((prev) => prev || c));
  }, [code]);

  // Pakistan me Mithai sirf allowed email (server decide karta hai: user.pkMithai) ko dikhti hai.
  // Baqi sab ko Pakistan me sirf Evelyn One (water).
  // Dropdown wala admin: Pakistan = sirf Evelyn One, USA = sirf Mithai House
  const active = SITE_COUNTRY || (canSwitch && override ? override : code);
  const pkMithai = !!user?.pkMithai && !canSwitch;
  const country = useMemo(() => {
    if (!active) return null;
    const base = COUNTRIES[active];
    if (active === "PK" && !pkMithai)
      return {
        ...base,
        categories: ["aqua"],
        tagline: "Pure Drinking Water",
        bar: "Cash on delivery across Pakistan · Evelyn One pure drinking water",
      };
    return base;
  }, [active, pkMithai]);
  const fmt = useCallback(
    (n) => (country ? money(n, country) : String(n)),
    [country],
  );
  // Value memoized: jab tak country wagairah na badle, saare useGeo() wale components dobara render nahi hote
  const geoValue = useMemo(
    () => ({
      country,
      ready: !!country,
      fmt,
      refresh,
      canSwitch,
      setOverride,
      detected: code,
    }),
    [country, fmt, refresh, canSwitch, setOverride, code],
  );
  return <GeoCtx.Provider value={geoValue}>{children}</GeoCtx.Provider>;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession()?.user || null);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("session-expired", onExpired);
    return () => window.removeEventListener("session-expired", onExpired);
  }, []);

  const finish = (r) => {
    setSession({ token: r.token, refresh: r.refresh, user: r.user });
    setUser(r.user);
    return r.user;
  };
  const signin = async (email, password) =>
    finish(await api("/auth/signin", json("POST", { email, password })));
  const signup = async (form) =>
    finish(await api("/auth/signup", json("POST", form)));
  const signout = () => {
    clearSession();
    setUser(null);
  };
  // Server se taaza user (isAdmin, profile) le aao
  useEffect(() => {
    if (!getSession()?.token) return;
    api("/auth/me")
      .then((r) => {
        const s = getSession();
        if (s) setSession({ ...s, user: r.user });
        setUser(r.user);
      })
      .catch(() => {});
  }, []);
  const updateProfile = async (form) => {
    const r = await api("/auth/profile", json("PUT", form));
    const s = getSession();
    if (s) setSession({ ...s, user: r.user });
    setUser(r.user);
    return r.user;
  };

  return (
    <AuthCtx.Provider value={{ user, signin, signup, signout, updateProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Catalog + Cart                                                      */
/* ------------------------------------------------------------------ */
const ShopCtx = createContext(null);
export const useShop = () => useContext(ShopCtx);

function ShopProvider({ children }) {
  const { country } = useGeo();
  const { user } = useAuth();
  const [rate, setRate] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("swarn_cart")) || [];
    } catch {
      return [];
    }
  });
  const [drawer, setDrawer] = useState(false);
  // cartBusy: add / qty change / delete par cart details me round loader dikhane ke liye
  const [cartBusy, setCartBusy] = useState(false);
  const [flash, setFlash] = useState(null);
  const busyTimer = useRef(null);
  const lastSig = useRef("");
  const pulse = useCallback(() => {
    setCartBusy(true);
    clearTimeout(busyTimer.current);
    busyTimer.current = setTimeout(() => setCartBusy(false), 750);
  }, []);
  useEffect(() => () => clearTimeout(busyTimer.current), []);

  const load = useCallback(
    async (silent = false) => {
      if (!country) return;
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const r = await api(`/products?country=${country.code}`);
        // sirf tab update jab kuch badla ho (sale / price), taake page baar baar re-render na ho
        const mine = r.products.filter((p) =>
          country.categories.includes(p.category),
        );
        const sig = JSON.stringify(mine);
        if (sig !== lastSig.current) {
          lastSig.current = sig;
          setProducts(mine);
        }
        if (r.rate) setRate(r.rate);
        setError("");
      } catch (e) {
        if (!silent) {
          lastSig.current = "";
          setProducts([]);
          setError(e.message);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    // user.id: login/logout par product list (Pakistan me Mithai rule) foran badal jaye
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [country, user?.id],
  );

  useEffect(() => {
    load();
  }, [load]);
  // Live rate + SALE foran dikhane ke liye: har 15 sec, tab/window wapis aane par chup chaap reload
  useEffect(() => {
    const again = () => document.visibilityState === "visible" && load(true);
    const t = setInterval(again, 15 * 1000);
    document.addEventListener("visibilitychange", again);
    window.addEventListener("focus", again);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", again);
      window.removeEventListener("focus", again);
    };
  }, [load]);
  useEffect(() => {
    localStorage.setItem("swarn_cart", JSON.stringify(cart));
  }, [cart]);

  // Cart lines sirf wahi products jo is country me available hain
  // Har line = product + (water ke liye) chuna hua option. line.id = cart line ki unique key,
  // line.pid = asli product id (server ko yahi jata hai), line.v = option key.
  const lines = useMemo(
    () =>
      cart
        .map((c) => {
          const prod = products.find((p) => p.id === (c.pid || c.id));
          if (!prod) return null;
          // Option ab available nahi (jaise Refill jab tak 19 L delivered na ho): line hata do,
          // warna galti se doosre option ki price lag sakti thi
          const opts = variantsOf(prod);
          if (c.v && opts.length && !opts.some((x) => x.key === c.v))
            return null;
          const v = pickVariant(prod, c.v);
          return {
            ...c,
            pid: prod.id,
            v: v?.key,
            product: v
              ? { ...viewOf(prod, v.key), name: `${prod.name} - ${v.label}` }
              : prod,
          };
        })
        .filter(Boolean),
    [cart, products],
  );
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.product.price, 0);

  // add(productId, qty, optionKey): water products me option (Pure / Mix / Refill ...) bhi jata hai
  const add = (pid, qty = 1, v) => {
    trackProductView(pid); // cart me add karna bhi product visit hai
    pulse();
    setFlash(pid);
    setTimeout(() => setFlash(null), 1400);
    setDrawer(true);
    const id = lineKey(pid, v);
    setCart((c) => {
      const f = c.find((x) => x.id === id);
      return f
        ? c.map((x) =>
            x.id === id ? { ...x, qty: Math.min(99, x.qty + qty) } : x,
          )
        : [...c, { id, pid, v: v || undefined, qty }];
    });
  };
  const setQty = (id, qty) => {
    pulse();
    setCart((c) =>
      qty < 1
        ? c.filter((x) => x.id !== id)
        : c.map((x) => (x.id === id ? { ...x, qty: Math.min(99, qty) } : x)),
    );
  };
  const remove = (id) => {
    pulse();
    setCart((c) => c.filter((x) => x.id !== id));
  };
  const clear = () => setCart([]);

  // Value memoized (add/setQty/remove sirf stable setters use karte hain, is liye purane closure bhi theek hain)
  const shopValue = useMemo(
    () => ({
      products,
      loading,
      error,
      reload: () => load(),
      rate,
      lines,
      count,
      total,
      add,
      setQty,
      remove,
      clear,
      drawer,
      setDrawer,
      cartBusy,
      flash,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      products,
      loading,
      error,
      load,
      rate,
      lines,
      count,
      total,
      drawer,
      cartBusy,
      flash,
    ],
  );
  return <ShopCtx.Provider value={shopValue}>{children}</ShopCtx.Provider>;
}

export function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <GeoProvider>
          <ShopProvider>{children}</ShopProvider>
        </GeoProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
