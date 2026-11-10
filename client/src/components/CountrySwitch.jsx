import { ChevronDown } from "lucide-react";
import { COUNTRIES } from "../config";
import { useGeo } from "../store";

// Country dropdown: sirf admin (wjahattahir@gmail.com) ko dikhta hai.
// Jo country chuno, poori website usi country ki (Pakistan = Evelyn One, USA = Best Mithai) ban jati hai.
export default function CountrySwitch({ className = "" }) {
  const { country, canSwitch, setOverride } = useGeo();
  if (!canSwitch || !country) return null;
  return (
    <label
      className={`relative inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 transition hover:border-gold-400 ${className}`}
    >
      <span className="sr-only">Choose country</span>
      <select
        value={country.code}
        onChange={(e) => setOverride(e.target.value)}
        aria-label="Choose country"
        className="cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-3.5 pr-8 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        {Object.values(COUNTRIES).map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code === "US" ? "USA" : c.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 text-slate-500"
      />
    </label>
  );
}
