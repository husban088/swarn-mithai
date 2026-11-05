import { Link } from "react-router-dom";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import PageHero from "../components/PageHero";
import { Thumb } from "../components/ProductCard";
import { useGeo, useShop } from "../store";

// Sirf cart: items, quantity, total. Delivery details aur payment /checkout page par hain.
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
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div className="animate-fadeUp">
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-champ-300 bg-champ-100/50 text-champ-600">
            <ShoppingBag size={42} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold text-royal sm:text-5xl">
            Your cart is empty
          </h1>
          <Link to="/shop" className="btn-gold mt-7">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Shopping cart"
        title="Your"
        accent="cart"
        crumb="Cart"
        text="Review your items, change quantities, then continue to checkout."
      />
      <div className="container-x grid gap-8 py-10 sm:py-12 lg:grid-cols-[1.4fr_1fr]">
        {/* Items (round loader qty/delete par) */}
        <div className="relative">
          <div className="space-y-4">
            {lines.map((l, i) => (
              <div
                key={l.id}
                style={{ animationDelay: `${i * 70}ms` }}
                className="group flex animate-rowIn gap-3 rounded-3xl border border-gold-100 bg-white p-3 transition duration-500 hover:border-champ-300 hover:shadow-xl hover:shadow-champ-200/40 sm:gap-4 sm:p-4"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
                  <Thumb p={l.product} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-display text-xl font-bold text-royal sm:text-2xl">
                        {l.product.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {l.product.unit} · {fmt(l.product.price)}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(l.id)}
                      aria-label="Remove"
                      className="self-start rounded-full p-1.5 text-neutral-400 transition duration-300 hover:rotate-12 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 rounded-full border border-gold-200">
                      <button
                        onClick={() => setQty(l.id, l.qty - 1)}
                        aria-label="Decrease"
                        className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-champ-100 active:scale-90"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        key={l.qty}
                        className="w-7 animate-pop text-center text-sm font-bold"
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
                    <span className="font-extrabold text-royal">
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
        <aside className="relative h-fit overflow-hidden rounded-3xl border border-champ-300 bg-gradient-to-b from-white to-champ-100/40 p-5 shadow-2xl shadow-champ-200/40 sm:p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-3xl font-bold text-royal">
            Order summary
          </h2>
          <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
            <span>Items ({count})</span>
            <span>{fmt(total)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-champ-200 pt-4">
            <span className="text-sm text-neutral-600">
              Total ({country.currency})
            </span>
            <span
              key={total}
              className="animate-pop text-3xl font-extrabold text-royal"
            >
              {fmt(total)}
            </span>
          </div>
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-champ-100/60 px-3 py-2 text-xs text-royal">
            <ShieldCheck size={14} className="shrink-0 text-champ-600" />
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
