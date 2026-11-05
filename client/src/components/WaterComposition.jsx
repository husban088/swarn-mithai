import { Droplets } from "lucide-react";

// Pani ki approx composition (mg/L) - label se. Sab aqua products me auto show hoti hai.
export const WATER_COMPOSITION = [
  { name: "Calcium", value: "20 - 60" },
  { name: "Sodium", value: "5 - 25" },
  { name: "Magnesium", value: "2 - 20" },
  { name: "Potassium", value: "0.2 - 5" },
  { name: "Chloride", value: "10 - 80" },
  { name: "Sulphate", value: "30 - 70" },
  { name: "pH", value: "6.5 - 8.5" },
  { name: "TDS", value: "90 - 250" },
];

export default function WaterComposition({ className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gold-200 bg-white ${className}`}
    >
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#060607] to-gold-600 px-4 py-3 text-white">
        <Droplets size={16} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
          Approx composition (mg/L)
        </span>
      </div>
      <dl className="divide-y divide-gold-100">
        {WATER_COMPOSITION.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm transition duration-300 hover:bg-gold-50"
          >
            <dt className="font-semibold text-royal">{r.name}</dt>
            <dd className="font-bold tabular-nums text-gold-600">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
