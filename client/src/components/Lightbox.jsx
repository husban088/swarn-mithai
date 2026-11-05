import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { cld } from "../lib/img";

const MIN = 1;
const MAX = 6;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Full screen image viewer: zoom in/out (wheel, pinch, buttons, double click),
// har taraf drag karke dekhna, slider (arrows, swipe, thumbnails, keyboard),
// counter (1/3) aur bahar click karne par band.
// getOrigin: wo function jo us badi image ka rect deta hai jahan se viewer khula tha.
// Khulte waqt image wahin se barh kar full screen hoti hai aur band hote waqt
// (bahar click / X / Esc) wapis usi jagah ja kar set ho jati hai.
export default function Lightbox({
  images,
  start = 0,
  onClose,
  onChange,
  getOrigin,
  alt = "",
}) {
  const list = (images || []).filter(Boolean);
  const n = list.length;
  const [i, setI] = useState(clamp(start, 0, Math.max(0, n - 1)));
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const [drag, setDrag] = useState(false);
  const [swipe, setSwipe] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const firstOpen = useRef(true);
  const dirRef = useRef(0);
  const originFn = useRef(getOrigin);
  originFn.current = getOrigin;
  const closeFn = useRef(onClose);
  closeFn.current = onClose;

  const stage = useRef(null);
  const img = useRef(null);
  const tRef = useRef(t);
  tRef.current = t;
  const swipeRef = useRef(0);
  const ptrs = useRef(new Map());
  const g = useRef({ moved: 0, startDist: 0, startS: 1, last: null, sx: 0 });

  const go = (d) => {
    if (n < 2) return;
    dirRef.current = d;
    setI((v) => (v + d + n) % n);
  };
  const pick = (k) => {
    dirRef.current = k > i ? 1 : -1;
    setI(k);
  };

  // zoom/pan ko image ke andar hi rakhta hai
  const apply = (s, x, y) => {
    s = clamp(s, MIN, MAX);
    const el = img.current;
    const box = stage.current;
    let mx = 0;
    let my = 0;
    if (el && box) {
      mx = Math.max(0, (el.offsetWidth * s - box.clientWidth) / 2);
      my = Math.max(0, (el.offsetHeight * s - box.clientHeight) / 2);
    }
    setT({ s, x: clamp(x, -mx, mx), y: clamp(y, -my, my) });
  };

  // (cx, cy) screen point ke upar zoom
  const zoomTo = (ns, cx, cy) => {
    const box = stage.current;
    if (!box) return;
    const cur = tRef.current;
    ns = clamp(ns, MIN, MAX);
    const r = box.getBoundingClientRect();
    const px = cx - (r.left + r.width / 2);
    const py = cy - (r.top + r.height / 2);
    const k = ns / cur.s;
    apply(ns, px - (px - cur.x) * k, py - (py - cur.y) * k);
  };
  const zoomBy = (f) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    zoomTo(tRef.current.s * f, r.left + r.width / 2, r.top + r.height / 2);
  };
  const reset = () => setT({ s: 1, x: 0, y: 0 });

  // Image ki asli (bina zoom) jagah + origin tak ka transform
  const originTf = () => {
    const o = originFn.current?.();
    const el = img.current;
    const box = stage.current;
    if (!o || !el || !box || !o.width || !o.height) return null;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return null;
    const r = box.getBoundingClientRect();
    const cx = r.left + el.offsetLeft + w / 2;
    const cy = r.top + el.offsetTop + h / 2;
    const sc = Math.min(o.width / w, o.height / h);
    const dx = o.left + o.width / 2 - cx;
    const dy = o.top + o.height / 2 - cy;
    return `translate3d(${dx}px, ${dy}px, 0) scale(${sc})`;
  };
  const calm = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Band karna: image wapis usi badi image ki jagah ja kar set hoti hai
  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      closeFn.current?.();
    };
    const el = img.current;
    const to = originTf();
    if (to && el?.animate && !calm()) {
      const c = tRef.current;
      const cur = `translate3d(${c.x + swipeRef.current}px, ${c.y}px, 0) scale(${c.s})`;
      const a = el.animate(
        [
          { transform: cur, opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.78 },
          { transform: to, opacity: 0, offset: 1 },
        ],
        {
          duration: 480,
          easing: "cubic-bezier(.45,.05,.2,1)",
          fill: "forwards",
        },
      );
      a.onfinish = finish;
      setTimeout(finish, 650);
    } else {
      setTimeout(finish, 300);
    }
  };
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  // Khulte waqt: image badi image ki jagah se full screen tak barhti hai
  const onImgLoad = () => {
    setLoaded(true);
    const el = img.current;
    if (!firstOpen.current) {
      const d = dirRef.current;
      dirRef.current = 0;
      if (d && el?.animate && !calm()) {
        el.animate(
          [
            {
              transform: `translate3d(${d * 90}px, 0px, 0) scale(1)`,
              opacity: 0,
            },
            { transform: "translate3d(0px, 0px, 0) scale(1)", opacity: 1 },
          ],
          { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
      }
      return;
    }
    firstOpen.current = false;
    const from = originTf();
    if (from && el?.animate && !calm()) {
      el.animate(
        [
          { transform: from, opacity: 0.5 },
          { transform: "translate3d(0px, 0px, 0) scale(1)", opacity: 1 },
        ],
        { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    }
  };

  // image badalne par zoom reset (aur bahar wale slider ko bhi batao)
  useEffect(() => {
    reset();
    setLoaded(false);
    onChange?.(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  // page scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // keyboard (capture: pehle lightbox band ho, peeche wala modal nahi)
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (k === "Escape") requestCloseRef.current();
      else if (k === "ArrowRight") go(1);
      else if (k === "ArrowLeft") go(-1);
      else if (k === "+" || k === "=") zoomBy(1.4);
      else if (k === "-") zoomBy(1 / 1.4);
      else if (k === "0") reset();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // mouse wheel / trackpad zoom (passive:false zaruri hai)
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      zoomTo(
        tRef.current.s * Math.exp(-e.deltaY * 0.0018),
        e.clientX,
        e.clientY,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // neighbour images pehle se load
  useEffect(() => {
    if (n < 2) return;
    [list[(i + 1) % n], list[(i - 1 + n) % n]].forEach((u) => {
      const im = new Image();
      im.src = cld(u, "f_auto,q_auto,w_2400");
    });
  }, [i, n]); // eslint-disable-line react-hooks/exhaustive-deps

  const down = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stage.current?.setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const q = g.current;
    q.moved = 0;
    q.last = { x: e.clientX, y: e.clientY };
    q.sx = e.clientX;
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      q.startDist = Math.hypot(a.x - b.x, a.y - b.y);
      q.startS = tRef.current.s;
    }
    setDrag(true);
  };
  const move = (e) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const q = g.current;
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (q.startDist)
        zoomTo((q.startS * d) / q.startDist, (a.x + b.x) / 2, (a.y + b.y) / 2);
      q.moved = 99;
      return;
    }
    const dx = e.clientX - q.last.x;
    const dy = e.clientY - q.last.y;
    q.last = { x: e.clientX, y: e.clientY };
    q.moved += Math.abs(dx) + Math.abs(dy);
    const cur = tRef.current;
    if (cur.s > 1.01) apply(cur.s, cur.x + dx, cur.y + dy);
    else if (n > 1) {
      swipeRef.current = e.clientX - q.sx;
      setSwipe(swipeRef.current);
    }
  };
  const up = (e) => {
    ptrs.current.delete(e.pointerId);
    const q = g.current;
    if (ptrs.current.size === 1) {
      const [p] = [...ptrs.current.values()];
      q.last = p;
      q.sx = p.x;
      return;
    }
    if (ptrs.current.size === 0) {
      setDrag(false);
      if (tRef.current.s <= 1.01 && Math.abs(swipeRef.current) > 70)
        go(swipeRef.current < 0 ? 1 : -1);
      swipeRef.current = 0;
      setSwipe(0);
    }
  };

  const insideImg = (e) => {
    const r = img.current?.getBoundingClientRect();
    return (
      !!r &&
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    );
  };
  // image ke bahar click = band
  const click = (e) => {
    if (g.current.moved > 6) return;
    if (!insideImg(e)) requestClose();
  };
  const dbl = (e) => {
    if (!insideImg(e)) return;
    if (tRef.current.s > 1.01) reset();
    else zoomTo(2.6, e.clientX, e.clientY);
  };

  const btn =
    "pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-white/25 active:scale-90 disabled:opacity-30 disabled:hover:scale-100";

  if (!n) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`absolute inset-0 bg-[#060607]/95 backdrop-blur-xl ${closing ? "animate-fadeOut" : "fade-in"}`}
      />

      {/* Image stage */}
      <div
        ref={stage}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClick={click}
        onDoubleClick={dbl}
        className="absolute inset-0 flex items-center justify-center overflow-hidden px-3 pb-24 pt-20 sm:px-16"
        style={{ touchAction: "none" }}
      >
        {!loaded && (
          <div className="ring-loader absolute left-1/2 top-1/2 -ml-7 -mt-7" />
        )}
        <img
          key={i}
          ref={img}
          src={cld(list[i], "f_auto,q_auto,w_2400")}
          alt={alt}
          draggable={false}
          onLoad={onImgLoad}
          onError={() => setLoaded(true)}
          className="max-h-full max-w-full select-none object-contain"
          style={{
            opacity: loaded ? 1 : 0,
            transform: `translate3d(${t.x + swipe}px, ${t.y}px, 0) scale(${t.s})`,
            transition: drag
              ? "opacity .4s ease"
              : "transform .3s cubic-bezier(.2,.8,.2,1), opacity .4s ease",
            cursor: t.s > 1.01 ? (drag ? "grabbing" : "grab") : "zoom-in",
            willChange: "transform",
          }}
        />
      </div>

      {/* Top bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 transition-opacity duration-300 sm:p-5 ${closing ? "opacity-0" : ""}`}
      >
        <span className="pointer-events-auto rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold tracking-wider text-white backdrop-blur-md">
          {i + 1}/{n}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => zoomBy(1 / 1.4)}
            disabled={t.s <= 1.01}
            aria-label="Zoom out"
            className={btn}
          >
            <Minus size={18} />
          </button>
          <span className="pointer-events-none hidden min-w-[3.2rem] text-center text-xs font-bold text-white/80 sm:block">
            {Math.round(t.s * 100)}%
          </span>
          <button
            onClick={() => zoomBy(1.4)}
            disabled={t.s >= MAX - 0.01}
            aria-label="Zoom in"
            className={btn}
          >
            <Plus size={18} />
          </button>
          <button
            onClick={reset}
            disabled={t.s <= 1.01}
            aria-label="Reset zoom"
            className={`${btn} hidden sm:grid`}
          >
            <RotateCcw size={17} />
          </button>
          <button
            onClick={requestClose}
            aria-label="Close"
            className={`${btn} hover:rotate-90`}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Arrows */}
      {n > 1 && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center p-2 transition-opacity duration-300 sm:p-5 ${closing ? "opacity-0" : ""}`}
          >
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className={btn}
            >
              <ChevronLeft size={22} />
            </button>
          </div>
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 flex items-center p-2 transition-opacity duration-300 sm:p-5 ${closing ? "opacity-0" : ""}`}
          >
            <button onClick={() => go(1)} aria-label="Next" className={btn}>
              <ChevronRight size={22} />
            </button>
          </div>
        </>
      )}

      {/* Thumbnails */}
      {n > 1 && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 transition-opacity duration-300 sm:p-5 ${closing ? "opacity-0" : ""}`}
        >
          <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md">
            {list.map((u, k) => (
              <button
                key={u + k}
                onClick={() => pick(k)}
                aria-label={`Image ${k + 1}`}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition duration-300 sm:h-14 sm:w-14 ${k === i ? "scale-105 border-gold-300 opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
              >
                <img
                  src={cld(u, "f_auto,q_auto,w_120,h_120,c_fill")}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      {n === 1 && (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 hidden text-center text-xs text-white/50 sm:block">
          Scroll to zoom · drag to move · double-click to zoom in/out
        </p>
      )}
    </div>,
    document.body,
  );
}
