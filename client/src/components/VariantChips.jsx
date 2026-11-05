import { useGeo } from "../store";
import { variantsOf } from "../lib/variants";

// Options chips (image ke neeche):
//  - Water: Pure / Mix / Custom 50 PET, ya First time / Refill  (chhote pills)
//  - Mithai: Signature Box $12 / Special Box $20  (2 badi buttons, naam + price)
// Jo chuna jaye, uski image + price card / modal / product page me dikhti hai.
export default function VariantChips({ p, value, onChange, className = "" }) {
  const { fmt } = useGeo();
  const list = variantsOf(p);
  if (!list.length) return null;
  const cur = value || list[0].key;
  const sweets = p?.category === "sweets";

  const pick = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(key);
  };

  if (sweets) {
    return (
      <div
        role="radiogroup"
        aria-label="Choose box"
        className={`grid gap-2 ${list.length > 1 ? "grid-cols-2" : "grid-cols-1"} ${className}`}
      >
        {list.map((v) => {
          const on = v.key === cur;
          return (
            <button
              key={v.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={(e) => pick(e, v.key)}
              className={`group/chip relative flex min-w-0 flex-col items-start gap-0.5 rounded-2xl border px-2.5 py-2 text-left transition duration-300 hover:-translate-y-0.5 active:scale-95 ${
                on
                  ? "border-transparent bg-royal text-white shadow-md shadow-royal/30"
                  : "border-gold-200 bg-white text-neutral-700 hover:border-champ-300 hover:bg-gold-50"
              }`}
            >
              <span className="flex w-full items-center gap-1 whitespace-nowrap text-[12px] font-bold leading-tight">
                <span className="min-w-0 truncate">{v.label}</span>
              </span>
              <span
                className={`text-sm font-extrabold ${on ? "text-champ-300" : "text-royal"}`}
              >
                {fmt(v.price)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Choose option"
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {list.map((v) => {
        const on = v.key === cur;
        return (
          <button
            key={v.key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={(e) => pick(e, v.key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-wide transition duration-300 hover:-translate-y-0.5 active:scale-95 ${
              on
                ? "border-transparent bg-royal text-white shadow-md shadow-royal/30"
                : "border-gold-200 bg-white text-neutral-600 hover:border-champ-300 hover:bg-gold-50"
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
