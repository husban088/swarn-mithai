import { Link } from "react-router-dom";
import { brandFor } from "../config";
import { useGeo } from "../store";

// Mark: chhota seal (Best Mithai = "M", Evelyn One = paani ki boond). Navbar/footer me asli logo (Logo) use hota hai.
export function Mark({ size = 44, letter = "B", drop = false }) {
  const id = `lg-${letter}${drop ? "d" : "s"}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={drop ? "#4aa3f0" : "#3d9bea"} />
          <stop offset=".5" stopColor="#dcebfd" />
          <stop offset="1" stopColor={drop ? "#135fb8" : "#1d7fe0"} />
        </linearGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={drop ? "#1a1a1e" : "#17171b"}
        stroke={`url(#${id})`}
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="32"
        r="25"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth=".8"
        strokeDasharray="1.5 3"
      />
      {drop ? (
        <>
          <path
            d="M32 10c6 8 11 14 11 21a11 11 0 0 1-22 0c0-7 5-13 11-21z"
            fill={`url(#${id})`}
          />
          <path
            d="M27 32a5 5 0 0 0 5 5"
            fill="none"
            stroke="#1a1a1e"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 48c4 3 8 3 12 0s8-3 12 0"
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M32 11c3 5 3 8 0 11-3-3-3-6 0-11z M32 53c3-5 3-8 0-11-3 3-3 6 0 11z"
            fill={`url(#${id})`}
          />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontWeight="700"
            fontSize="26"
            fill={`url(#${id})`}
          >
            {letter}
          </text>
        </>
      )}
    </svg>
  );
}

// Country ke hisaab se asli brand logo (Pakistan = Evelyn One, USA = Best Mithai).
// Dono transparent hain (koi white plate/box nahi). BrandMark blue/dark cards par use hota hai,
// isliye Best Mithai ka safed (light) logo lagta hai. Safed background par light={false} do.
export function BrandMark({ size = 44, light = true }) {
  const { country } = useGeo();
  const b = brandFor(country?.code);
  if (b.mark) {
    const px = `min(${size}px, 42vw)`; // chhoti screen par apne aap chhota
    return (
      <img
        src={b.mark}
        alt={b.name}
        style={{ width: px, height: px }}
        className="select-none object-contain drop-shadow-[0_10px_24px_rgba(29,127,224,0.35)]"
        draggable="false"
      />
    );
  }
  return (
    <img
      src={light && b.logoLight ? b.logoLight : b.logo}
      alt={b.name}
      style={{ height: size, maxWidth: "100%" }}
      className="w-auto select-none object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
      draggable="false"
    />
  );
}

// light = dark background (footer) par; compact = tagline ke bina chhota version (Navbar, sidebar)
export default function Logo({ light = false, compact }) {
  const { country } = useGeo();
  const b = brandFor(country?.code);
  const evelyn = !!b.logoCompact;
  const small = compact ?? !light;

  let src = b.logo;
  let cls = "h-16 sm:h-[4.5rem]"; // Best Mithai
  if (light && b.logoLight) src = b.logoLight; // Best Mithai: dark background par safed logo
  if (evelyn) {
    if (small) {
      src = light ? b.logoCompactLight : b.logoCompact;
      cls = "h-10 sm:h-12 lg:h-[3.4rem]";
    } else {
      src = light ? b.logoLight : b.logo;
      cls = "h-14 sm:h-16";
    }
  }
  return (
    <Link
      to="/"
      aria-label={`${b.name} home`}
      className="group flex items-center"
    >
      <span>
        <img
          src={src}
          alt={b.name}
          className={`w-auto max-w-full select-none object-contain transition duration-500 group-hover:scale-105 ${cls}`}
          draggable="false"
        />
      </span>
    </Link>
  );
}
