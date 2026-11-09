import { Link } from "react-router-dom";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import PageHero from "../components/PageHero";
import { Thumb } from "../components/ProductCard";
import { useGeo, useShop } from "../store";

// Sirf cart: items, quantity, total. Delivery details aur payment /checkout page par hain.
// Fully responsive: 320px phone se lekar bade desktop tak (USA + Pakistan dono).
export default function Cart() {
  const { country, fmt } = useGeo();
  const { lines, total, count, setQty, remove, cartBusy, loading } = useShop();

  if (loading && !lines.length) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16">
        <div className="ring-loader" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center overflow-x-hidden py-12 text-center sm:py-16">
        <div className="animate-fadeUp">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-champ-300 bg-champ-100/50 text-champ-600 sm:h-24 sm:w-24">
            <ShoppingBag size={38} />
          </span>
          <h1 className="mt-5 break-words font-display text-3xl font-bold text-royal sm:text-5xl">
            Your cart is empty
          </h1>
          <Link to="/shop" className="btn-gold mt-6 sm:mt-7">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-clip">
      <PageHero
        eyebrow="Shopping cart"
        title="Your"
        accent="cart"
        crumb="Cart"
        text="Review your items, change quantities, then continue to checkout."
      />
      <div className="container-x grid gap-6 py-8 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:items-start">
        {/* Items (round loader qty/delete par) */}
        <div className="relative min-w-0">
          <div className="space-y-3 sm:space-y-4">
            {lines.map((l, i) => (
              <div
                key={l.id}
                style={{ animationDelay: `${i * 70}ms` }}
                className="group flex animate-rowIn gap-3 rounded-2xl border border-gold-100 bg-white p-3 transition duration-500 hover:border-champ-300 hover:shadow-xl hover:shadow-champ-200/40 sm:gap-4 sm:rounded-3xl sm:p-4"
              >
                <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28 sm:rounded-2xl">
                  <Thumb p={l.product} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="line-clamp-2 break-words font-display text-lg font-bold leading-tight text-royal sm:text-2xl">
                        {l.product.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500">
                        <span className="break-words">{l.product.unit}</span>
                        <span aria-hidden="true">·</span>
                        <span className="whitespace-nowrap">
                          {fmt(l.product.price)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(l.id)}
                      aria-label="Remove"
                      className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-neutral-400 transition duration-300 hover:rotate-12 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <div className="flex shrink-0 items-center gap-1 rounded-full border border-gold-200">
                      <button
                        onClick={() => setQty(l.id, l.qty - 1)}
                        aria-label="Decrease"
                        className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-champ-100 active:scale-90"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        key={l.qty}
                        className="min-w-[1.75rem] animate-pop text-center text-sm font-bold"
                      >
                        {l.qty}
                      </span>
                      <button
                        onClick={() => setQty(l.id, l.qty + 1)}
                        aria-label="Increase"
                        className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-champ-100 active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="whitespace-nowrap text-base font-extrabold text-royal sm:text-lg">
                      {fmt(l.qty * l.product.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {cartBusy && (
            <div className="absolute inset-0 z-10 grid animate-pop place-items-center rounded-3xl bg-white/70 backdrop-blur-[2px]">
              <div className="text-center">
                <div className="ring-loader mx-auto" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-champ-600">
                  Updating
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="relative h-fit min-w-0 overflow-hidden rounded-2xl border border-champ-300 bg-gradient-to-b from-white to-champ-100/40 p-4 shadow-2xl shadow-champ-200/40 sm:rounded-3xl sm:p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-bold text-royal sm:text-3xl">
            Order summary
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-neutral-600">
            <span>Items ({count})</span>
            <span className="whitespace-nowrap">{fmt(total)}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-champ-200 pt-4">
            <span className="text-sm text-neutral-600">
              Total ({country.currency})
            </span>
            <span
              key={total}
              className="animate-pop whitespace-nowrap text-2xl font-extrabold text-royal sm:text-3xl"
            >
              {fmt(total)}
            </span>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-champ-100/60 px-3 py-2 text-xs leading-relaxed text-royal">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-champ-600" />
            <span>
              No account needed. Pay with cash on delivery, card or PayPal at
              checkout.
            </span>
          </p>
          <Link to="/checkout" className="btn-gold mt-5 w-full !py-3.5">
            Proceed to checkout
          </Link>
          <Link to="/shop" className="btn-line mt-2 w-full !py-3">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
