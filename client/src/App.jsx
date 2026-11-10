import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import WhatsAppButton from "./components/WhatsAppButton";
import { useAuth, useGeo } from "./store";
import { SITE_COUNTRY, brandFor } from "./config";
import Home from "./pages/Home";
import { track } from "./lib/nav";
import { bootCode, onBootCode } from "./lib/geoBoot";

// Baqi pages sirf tab download hote hain jab khulen (pehli load bohat halki rehti hai).
// Admin wale pages me PDF/zip libraries hain, wo ab aam customers ko download hi nahi hoti.
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderPlaced = lazy(() => import("./pages/OrderPlaced"));
const Contact = lazy(() => import("./pages/Contact"));
const SignIn = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.SignIn })),
);
const SignUp = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.SignUp })),
);
const Admin = lazy(() => import("./pages/Admin"));
const AdminProductForm = lazy(() => import("./pages/AdminProductForm"));
const Profile = lazy(() => import("./pages/Profile"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const Events = lazy(() => import("./pages/Events"));

// Home khulne ke baad khali waqt me zyada use hone wale pages peeche se download kar lo
function usePrefetchPages() {
  useEffect(() => {
    const run = () => {
      import("./pages/Shop");
      import("./pages/ProductDetail");
      import("./pages/Cart");
      import("./pages/Checkout");
    };
    const t =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(run, { timeout: 4000 })
        : setTimeout(run, 2500);
    return () => {
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(t);
      else clearTimeout(t);
    };
  }, []);
}

function PageFallback() {
  return <div className="min-h-[60vh]" aria-hidden="true" />;
}

// Naya page (link click) = top par. Back/Forward (POP) = jahan chhoda tha wahi scroll position.
// Isi se product detail se Back karne par Shop usi pagination page aur usi jagah khulta hai.
function ScrollTop() {
  const loc = useLocation();
  const navType = useNavigationType();
  const positions = useRef(new Map()); // location.key -> scrollY
  const keyRef = useRef(loc.key);
  const pathRef = useRef(loc.pathname);

  // Browser ki apni restore band, hum khud karte hain (lazy pages me browser ka restore galat chalta hai)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Har scroll par is page ki position yaad rakho
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        positions.current.set(keyRef.current, window.scrollY);
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    const pathChanged = pathRef.current !== loc.pathname;
    // Pehle saved position parho, phir key badlo (warna naye page ka scroll event usay overwrite kar de)
    const target =
      navType === "POP" ? positions.current.get(loc.key) : undefined;
    keyRef.current = loc.key;
    pathRef.current = loc.pathname;

    if (navType === "POP" && target > 0) {
      // Page abhi load ho raha ho sakta hai (lazy chunk / products), is liye height milne tak dobara try
      let tries = 0;
      let raf = 0;
      const attempt = () => {
        window.scrollTo({ top: target, left: 0, behavior: "instant" });
        tries += 1;
        if (Math.abs(window.scrollY - target) > 2 && tries < 90) {
          raf = requestAnimationFrame(attempt);
        }
      };
      attempt();
      return () => cancelAnimationFrame(raf);
    }
    // Sirf page (pathname) badle to top; ?page= / filter badle to scroll na chhero
    if (pathChanged) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [loc.key]);
  return null;
}

function ScrollProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    // React state nahi: scroll par sirf ek transform badalta hai (re-render zero)
    const on = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px]">
      <div
        ref={bar}
        className="champ-bg h-full w-full origin-left will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

// Splash: sahi country ka logo hi dikhao. Country pakki hone tak sirf spinner (galat logo kabhi nahi).
function Splash() {
  const { country: geo } = useGeo();
  const [code, setCode] = useState(() => SITE_COUNTRY || bootCode());
  useEffect(() => {
    if (code) return;
    return onBootCode(setCode);
  }, [code]);
  const b = code ? brandFor(geo?.code || code) : null;
  return (
    <div className="grain relative grid min-h-screen place-items-center overflow-hidden bg-royal">
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-champ-400/25 blur-3xl" />
      <div className="relative px-6 text-center">
        {b && (
          <img
            src={b.logoLight || b.logo}
            alt={b.name}
            draggable="false"
            className="mx-auto h-20 w-auto max-w-[78vw] select-none object-contain drop-shadow-[0_10px_30px_rgba(29,127,224,0.45)] sm:h-24"
          />
        )}
        <div className="ring-loader mx-auto mt-7 !h-11 !w-11" />
      </div>
    </div>
  );
}

export default function App() {
  const { ready, country } = useGeo();
  const { user } = useAuth();
  const { pathname } = useLocation();
  track(pathname); // pichla page yaad rakho (Back to shop ke liye)
  usePrefetchPages();

  // Browser tab title + search description: Pakistan = Evelyn One (water), baqi = Best Mithai (mithai)
  useEffect(() => {
    if (!country) return;
    const pk = country.code === "PK";
    const b = brandFor(country.code);
    if (window.__setFavicon) window.__setFavicon(country.code); // tab icon: PK = Evelyn One, US = Best Mithai
    document.title = pk
      ? `${b.name} - Pure Drinking Water`
      : "Best Mithai - Luxury Mithai & Special Event Boxes";
    const desc = pk
      ? `${b.name}: purified drinking water in 500 ml, 1.5 L and 19 L bottles. Home and office delivery with pay on delivery.`
      : "Best Mithai: luxury Pakistani mithai in 20 varieties. Special event boxes for weddings, birthdays and baby born. Second-day delivery.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", desc);
  }, [country]);

  if (!ready) return <Splash />;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f6f7]">
      <ScrollTop />
      <ScrollProgress />
      <Navbar />
      <CartDrawer />
      <main key={pathname} className="flex-1 animate-pageIn">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-placed/:id" element={<OrderPlaced />} />
            <Route
              path="/profile"
              element={
                user ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" state={{ from: "/profile" }} replace />
                )
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/events" element={<Events />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <SignIn />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/" replace /> : <SignUp />}
            />
            <Route
              path="/admin"
              element={
                user?.isAdmin ? (
                  <Admin />
                ) : (
                  <Navigate to={user ? "/" : "/login"} replace />
                )
              }
            />
            {["/admin/products/new", "/admin/products/:id/edit"].map((path) => (
              <Route
                key={path}
                path={path}
                element={
                  user?.isAdmin ? (
                    <AdminProductForm />
                  ) : (
                    <Navigate to={user ? "/" : "/login"} replace />
                  )
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
