import { useState } from "react";
import { imagesOf } from "../lib/img";
import FitImage from "./FitImage";
import { Mark } from "./Logo";

// Product ki image (poori dikhti hai, stretch nahi hoti). Image na ho ya load na ho
// to luxury placeholder dikhata hai.
export default function Thumb({ p, className = "", w = 900, zoom = true }) {
  const [bad, setBad] = useState(false);
  const aqua = p.category === "aqua";
  // Options wale product ki base image na ho to pehle option ki image
  const src =
    imagesOf(p)[0] ||
    (Array.isArray(p.variants)
      ? p.variants.map((v) => v?.images?.[0] || v?.image).find(Boolean)
      : undefined);
  if (src && !bad) {
    return (
      <FitImage
        src={src}
        alt={p.name}
        w={w}
        zoom={zoom}
        className={className}
        onFail={() => setBad(true)}
      />
    );
  }
  return (
    <div
      className={`grain relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br from-[#060607] via-[#17171b] to-[#0a3a78] ${className}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 animate-glow rounded-full bg-champ-400/30 blur-2xl" />
      <div className="relative transition duration-700 group-hover:rotate-[8deg] group-hover:scale-110">
        {aqua ? (
          <img
            src="/brand/evelyn-one-mark.svg"
            alt=""
            className="h-20 w-20 select-none object-contain"
            draggable="false"
          />
        ) : (
          <Mark size={64} />
        )}
      </div>
    </div>
  );
}
