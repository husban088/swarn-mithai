import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, ZoomIn } from "lucide-react";
import Thumb from "./Thumb";
import FitImage from "./FitImage";
import Lightbox from "./Lightbox";
import { cld, cldVideo, imagesOf, videoOf, videoPoster } from "../lib/img";

// Product ka slider: badi image + uske neeche saari images ke thumbnails (click par upar badi
// image badal jati hai) + (agar ho to) video. Counter 1/5, arrows, swipe.
// Badi image par zoom (magnifier) icon: click par full screen viewer khulta hai (zoom in/out,
// har taraf drag, slider 1/5) aur band hone par image wapis usi jagah ja kar set hoti hai.
// Har image poori dikhti hai (stretch/crop nahi), khali jagah blur se bharti hai.
// variant="page": product page par  |  variant="modal": detail modal ke andar
// overlay: badi image ke upar dikhane wali cheezein (badges, price) - sirf modal me
export default function Gallery({ p, variant = "page", overlay = null }) {
  const imgs = useMemo(() => imagesOf(p), [p]);
  const video = videoOf(p);
  const poster = videoPoster(video);
  const media = useMemo(
    () => [
      ...imgs.map((u) => ({ t: "img", u })),
      ...(video ? [{ t: "vid", u: video }] : []),
    ],
    [imgs, video],
  );
  const n = media.length;
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const touch = useRef({ x: 0, swiped: false });
  const frameRef = useRef(null);
  const stripRef = useRef(null);
  const modal = variant === "modal";

  // product ya option (Signature / Special Box) badalne par wapis pehli image par
  useEffect(() => setI(0), [p.id, imgs[0]]);

  const cur = media[Math.min(i, Math.max(0, n - 1))];
  const go = (d) => setI((v) => (v + d + n) % n);
  const openFs = () => cur?.t === "img" && setOpen(true);

  // Active thumbnail ko strip me beech me laao (page ko scroll kiye baghair)
  useEffect(() => {
    const strip = stripRef.current;
    const btn = strip?.children?.[i];
    if (!strip || !btn) return;
    strip.scrollTo({
      left: btn.offsetLeft - strip.clientWidth / 2 + btn.clientWidth / 2,
      behavior: "smooth",
    });
  }, [i]);

  const onTouchStart = (e) => {
    touch.current = { x: e.touches[0].clientX, swiped: false };
  };
  const onTouchEnd = (e) => {
    if (n < 2) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 50) {
      touch.current.swiped = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const onClickImg = () => {
    if (touch.current.swiped) {
      touch.current.swiped = false;
      return;
    }
    openFs();
  };

  const glass =
    "grid place-items-center rounded-full border border-white/25 bg-[#060607]/60 text-white backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-gold-600 active:scale-90";
  const frame = modal
    ? "relative w-full aspect-square max-h-[62vh] md:max-h-none md:aspect-auto md:min-h-0 md:flex-1 bg-[#111114]"
    : "aspect-square rounded-[2rem] border border-champ-200 bg-[#111114] shadow-2xl shadow-champ-300/40";

  const badges = (
    <>
      {!modal && p.featured && (
        <span className="absolute left-4 top-4 z-10 rounded-full champ-bg px-4 py-1.5 text-xs font-bold text-royal shadow">
          Bestseller
        </span>
      )}
      {!modal && !p.in_stock && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/70 text-lg font-bold text-royal">
          Out of stock
        </div>
      )}
      {modal && overlay}
    </>
  );

  if (!n) {
    return (
      <div className={modal ? "flex min-h-0 flex-1 flex-col" : ""}>
        <div
          ref={frameRef}
          className={`group relative overflow-hidden ${frame}`}
        >
          <Thumb p={p} />
          {badges}
        </div>
      </div>
    );
  }

  const main = (
    <div ref={frameRef} className={`group relative overflow-hidden ${frame}`}>
      {cur.t === "img" ? (
        <button
          type="button"
          onClick={onClickImg}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-label="View image full screen"
          className="absolute inset-0 block cursor-zoom-in"
        >
          <FitImage
            key={cur.u}
            src={cur.u}
            alt={`${p.name} ${i + 1}`}
            w={1200}
            eager
            zoom={false}
          />
        </button>
      ) : (
        <div className="absolute inset-0 bg-[#060607]">
          {poster && (
            <img
              aria-hidden="true"
              alt=""
              src={poster}
              className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl"
            />
          )}
          <video
            key={cur.u}
            src={cldVideo(cur.u)}
            poster={poster || undefined}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      )}

      {/* Zoom (magnifier) icon: click par full screen slider */}
      {cur.t === "img" && (
        <button
          type="button"
          onClick={openFs}
          aria-label="Zoom / full screen"
          title="Zoom / full screen"
          className={`${glass} absolute z-20 h-11 w-11 ${modal ? "right-16 top-4 md:right-4" : "right-4 top-4"}`}
        >
          <ZoomIn size={20} />
        </button>
      )}

      {/* Counter 1/5 */}
      {n > 1 && (
        <span
          className={`pointer-events-none absolute z-20 rounded-full border border-white/25 bg-[#060607]/60 px-3 py-1 text-xs font-bold tracking-wider text-white backdrop-blur-md ${cur.t === "vid" ? "right-4 top-4" : "bottom-4 right-4"}`}
        >
          {Math.min(i, n - 1) + 1}/{n}
        </span>
      )}

      {/* Arrows (video ke controls se na takrayein, isliye thoda upar) */}
      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className={`${glass} absolute left-3 top-[42%] z-20 h-10 w-10 -translate-y-1/2 sm:opacity-0 sm:group-hover:opacity-100`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className={`${glass} absolute right-3 top-[42%] z-20 h-10 w-10 -translate-y-1/2 sm:opacity-0 sm:group-hover:opacity-100`}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {badges}
    </div>
  );

  const strip = n > 1 && (
    <div
      ref={stripRef}
      className={`flex gap-2 overflow-x-auto ${modal ? "shrink-0 bg-[#060607]/70 p-3" : "mt-3 pb-1"}`}
    >
      {media.map((m, k) => (
        <button
          key={m.u + k}
          type="button"
          onClick={() => setI(k)}
          aria-label={m.t === "vid" ? "Video" : `Image ${k + 1}`}
          aria-current={k === i}
          className={`group/t relative shrink-0 overflow-hidden rounded-2xl border-2 transition duration-300 hover:-translate-y-0.5 ${modal ? "h-14 w-14 sm:h-16 sm:w-16" : "h-16 w-16 sm:h-20 sm:w-20"} ${k === i ? "border-gold-400 opacity-100 shadow-lg shadow-gold-300/50" : "border-champ-200/60 opacity-70 hover:opacity-100"}`}
        >
          {m.t === "img" ? (
            <FitImage src={m.u} w={200} zoom={false} />
          ) : (
            <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#060607] to-gold-600 text-white">
              {poster && (
                <img
                  src={cld(poster)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
              )}
              <Play size={20} className="relative" fill="currentColor" />
            </span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className={modal ? "flex min-h-0 flex-1 flex-col" : ""}>
        {main}
        {strip}
      </div>
      {open && (
        <Lightbox
          images={imgs}
          start={Math.min(i, imgs.length - 1)}
          alt={p.name}
          onChange={setI}
          getOrigin={() => frameRef.current?.getBoundingClientRect()}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
