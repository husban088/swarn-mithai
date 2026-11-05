import { cld, tinyOf } from "../lib/img";

// Poori image dikhata hai (na stretch, na crop). Khali jagah par usi image ka
// dhundhla background bharta hai, is liye kisi bhi screen par white space nahi aata.
// Dhundhla background ab bohat chhoti image se banta hai (CSS blur filter nahi), is liye scroll smooth rehta hai.
// Parent ko `group` class dein to hover par halka zoom bhi milta hai.
export default function FitImage({
  src,
  alt = "",
  w = 900,
  eager = false,
  zoom = true,
  className = "",
  imgClassName = "",
  onFail,
}) {
  const tiny = tinyOf(src);
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#111114] ${className}`}
    >
      <img
        aria-hidden="true"
        alt=""
        src={tiny || cld(src, "f_auto,q_auto:low,w_160")}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={`absolute inset-0 h-full w-full scale-110 object-cover opacity-90 ${tiny ? "" : "blur-xl"}`}
      />
      <div className="absolute inset-0 bg-[#060607]/10" />
      <img
        src={cld(src, `f_auto,q_auto:good,w_${w}`)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onError={onFail}
        className={`fade-in absolute inset-0 h-full w-full object-contain transition duration-700 ${zoom ? "group-hover:scale-[1.04]" : ""} ${imgClassName}`}
      />
    </div>
  );
}
