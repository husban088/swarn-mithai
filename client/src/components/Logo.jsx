import { Link } from "react-router-dom";
import { brandFor } from "../config";
import { useGeo } from "../store";

// Mark: chhota seal (Mithai House = "M", Apna Pani = paani ki boond). Navbar/footer me asli logo (Logo) use hota hai.
export function Mark({ size = 44, letter = "M", drop = false }) {
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

// Country ke hisaab se asli brand logo (Pakistan = Apna Pani, USA = Mithai House).
// Logos client/public/brand/ me hain: apna-pani.png aur mithai-house.png
// plate = true: logo ke peechay safed card (dark background par Mithai House ka kala logo bhi saaf dikhe)
export function BrandMark({ size = 44, plate = true }) {
  const { country } = useGeo();
  const b = brandFor(country?.code);
  const img = (
    <img
      src={b.logo}
      alt={b.name}
      style={{ height: size }}
      className="w-auto max-w-none select-none object-contain"
      draggable="false"
    />
  );
  if (!plate) return img;
  return (
    <span className="inline-flex items-center rounded-2xl bg-white p-2 shadow-lg shadow-black/20">
      {img}
    </span>
  );
}

export default function Logo({ light = false }) {
  const { country } = useGeo();
  const b = brandFor(country?.code);
  return (
    <Link
      to="/"
      aria-label={`${b.name} home`}
      className="group flex items-center"
    >
      <span
        className={
          light
            ? "rounded-2xl bg-white px-3 py-1.5 shadow-lg shadow-black/25"
            : ""
        }
      >
        <img
          src={b.logo}
          alt={b.name}
          className={`w-auto select-none object-contain transition duration-500 group-hover:scale-105 ${
            b.key === "apnapani"
              ? "h-[4.75rem] sm:h-[5.75rem]"
              : "h-16 sm:h-[4.5rem]"
          }`}
          draggable="false"
        />
      </span>
    </Link>
  );
}
