import { useEffect, useRef, useState } from "react";
import { cld, fitUrl, tinyOf } from "../lib/img";

// Poori image dikhata hai (na stretch, na crop). Khali jagah par usi image ka
// dhundhla background bharta hai, is liye kisi bhi screen par white space nahi aata.
//
// Dhundhli (blur) placeholder ab kabhi nahi dikhti: jab tak asli image load na ho
// saaf dark skeleton dikhta hai, image aate hi seedhi sharp image fade-in hoti hai.
// Dhundhla backdrop sirf image load hone ke BAAD, khali jagah bharne ke liye aata hai.
// Parent ko `group` class dein to hover par halka zoom bhi milta hai.
export default function FitImage({
  src,
  alt = "",
  w = 700,
  eager = false,
  zoom = true,
  className = "",
  imgClassName = "",
  onFail,
}) {
  const tiny = tinyOf(src);
  const ref = useRef(null);
  const [ok, setOk] = useState(false);

  // Image pehle se cache me ho (prefetch / dobara visit) to load event miss na ho
  useEffect(() => {
    setOk(false);
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setOk(true);
  }, [src, w]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#111114] ${className}`}
    >
      {!ok && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#17171b] via-[#202026] to-[#17171b]"
        />
      )}
      <img
        aria-hidden="true"
        alt=""
        src={tiny || cld(src, "f_auto,q_auto:low,w_160")}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={`absolute inset-0 h-full w-full scale-110 object-cover transition-opacity duration-500 ${ok ? "opacity-90" : "opacity-0"} ${tiny ? "" : "blur-xl"}`}
      />
      <div className="absolute inset-0 bg-[#060607]/10" />
      <img
        ref={ref}
        src={fitUrl(src, w)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={eager ? "high" : "auto"}
        draggable={false}
        onLoad={() => setOk(true)}
        onError={onFail}
        className={`absolute inset-0 h-full w-full object-contain transition duration-500 ${ok ? "opacity-100" : "opacity-0"} ${zoom ? "group-hover:scale-[1.04]" : ""} ${imgClassName}`}
      />
    </div>
  );
}
