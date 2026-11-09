import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  MessageSquare,
  PenLine,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Lightbox from "./Lightbox";
import { api, json } from "../lib/api";
import { uploadDirect } from "../lib/upload";
import { cld } from "../lib/img";
import { fmtDate } from "../lib/format";
import { useAuth, useToast } from "../store";

const MAX_PHOTOS = 4;
const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const stored = (k) => {
  try {
    return localStorage.getItem(k) || "";
  } catch {
    return "";
  }
};

export function Stars({ value = 0, size = 16, className = "" }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.min(1, Math.max(0, value - (n - 1)));
        return (
          <span
            key={n}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star size={size} className="absolute inset-0 text-gold-200" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                size={size}
                className="fill-gold-500 text-gold-500"
                style={{ minWidth: size }}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export const summarize = (list) => {
  const dist = [0, 0, 0, 0, 0, 0];
  list.forEach((r) => (dist[r.rating] += 1));
  const count = list.length;
  const avg = count ? list.reduce((a, r) => a + r.rating, 0) / count : 0;
  return { count, avg, dist };
};

// Product details page ke neeche reviews: har koi (login ke baghair bhi) review de sakta hai.
// Form tab tak band rehta hai jab tak "Write review" na dabayein.
export default function Reviews({ productId, onSummary }) {
  const { user } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState(5);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(() => stored("swarn_rname"));
  const [email, setEmail] = useState(() => stored("swarn_remail"));
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const [lb, setLb] = useState(null); // { images, start }

  // Login user ka naam/email khud aa jaye
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const sum = useMemo(() => summarize(list), [list]);
  useEffect(() => {
    onSummary?.(sum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sum]);

  const load = useCallback(async () => {
    try {
      const r = await api(`/products/${productId}/reviews`);
      setList(r.reviews);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const resetForm = () => {
    setRating(0);
    setHover(0);
    setComment("");
    setPhotos([]);
  };

  useEffect(() => {
    setLoading(true);
    setList([]);
    setShown(5);
    setOpen(false);
    resetForm();
    load();
  }, [productId, load, user?.id]);

  const toggle = () => {
    if (open) resetForm();
    setOpen((o) => !o);
  };

  const pick = async (files) => {
    const room = MAX_PHOTOS - photos.length - uploading;
    const chosen = [...(files || [])].slice(0, Math.max(0, room));
    if (!chosen.length) {
      if (files?.length) toast(`Maximum ${MAX_PHOTOS} photos`, "err");
      return;
    }
    for (const file of chosen) {
      if (!/^image\//.test(file.type)) {
        toast("Only image files", "err");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast("Each photo must be under 5 MB", "err");
        continue;
      }
      setUploading((c) => c + 1);
      try {
        const r = await uploadDirect(file, { signPath: "/upload/review-sign" });
        setPhotos((p) => [...p, r.url]);
      } catch (e) {
        toast(e.message, "err");
      } finally {
        setUploading((c) => c - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast("Please select a star rating", "err");
    if (!name.trim()) return toast("Please enter your name", "err");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return toast("Please enter a valid email", "err");
    setBusy(true);
    try {
      const r = await api(
        `/products/${productId}/reviews`,
        json("POST", {
          rating,
          comment,
          images: photos,
          name: name.trim(),
          email: email.trim(),
        }),
      );
      if (!user) {
        try {
          localStorage.setItem("swarn_rname", name.trim());
          localStorage.setItem("swarn_remail", email.trim());
        } catch {
          /* ignore */
        }
      }
      setList((l) => [r.review, ...l]);
      resetForm();
      setOpen(false);
      toast("Thank you! Your review is live");
    } catch (err) {
      toast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const del = async (r) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api(`/reviews/${r.id}`, { method: "DELETE" });
      setList((l) => l.filter((x) => x.id !== r.id));
      toast("Review deleted");
    } catch (err) {
      toast(err.message, "err");
    }
  };

  const active = hover || rating;

  // Jab tak koi review nahi: poora section (heading, rating box, list) hidden rehta hai.
  // Pehla review post hote hi list update hoti hai aur poora section foran dikh jata hai.
  const empty = list.length === 0;
  if (loading) return null;

  return (
    <section
      id="reviews"
      className={`scroll-mt-28 ${empty ? "mt-10" : "mt-16 sm:mt-20"}`}
    >
      {!empty && (
        <div className="text-center">
          <span className="eyebrow">Customer reviews</span>
          <h2 className="mt-3 font-display text-4xl font-bold text-royal sm:text-5xl">
            What people say
          </h2>
        </div>
      )}

      <div
        className={`mx-auto w-full max-w-4xl space-y-6 ${empty ? "" : "mt-8"}`}
      >
        {/* Summary */}
        {!empty && (
        <div className="relative overflow-hidden rounded-3xl bg-royal p-5 text-white shadow-xl shadow-royal/20 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 animate-glow rounded-full bg-gold-500/30 blur-3xl" />
          <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
            <div className="flex items-center gap-5">
              <div className="gold-text font-display text-6xl font-bold leading-none sm:text-7xl">
                {sum.count ? sum.avg.toFixed(1) : "–"}
              </div>
              <div>
                <Stars value={sum.avg} size={20} />
                <div className="mt-1 text-xs text-champ-200">
                  {sum.count
                    ? `${sum.count} review${sum.count > 1 ? "s" : ""}`
                    : "No reviews yet"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((n) => {
                const pct = sum.count ? (sum.dist[n] / sum.count) * 100 : 0;
                return (
                  <div key={n} className="flex items-center gap-3 text-xs">
                    <span className="flex w-7 items-center gap-1 font-semibold text-champ-200">
                      {n} <Star size={11} className="fill-current" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        key={`${n}-${sum.count}`}
                        className="gold-bg h-full origin-left animate-lineGrow rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-champ-200">
                      {sum.dist[n]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Toggle button: band ho to "Write review", khula ho to "Cancel review" */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="review-form"
            className={open ? "btn-line" : "btn-gold"}
          >
            {open ? <X size={16} /> : <PenLine size={16} />}
            {open ? "Cancel review" : "Write review"}
          </button>
        </div>

        {/* Form (sirf open hone par) */}
        {open && (
          <form
            id="review-form"
            onSubmit={submit}
            className="mx-auto w-full max-w-3xl animate-fadeUp rounded-3xl border border-gold-100 bg-white p-5 shadow-xl shadow-champ-200/40 sm:p-8"
          >
            <h3 className="text-center font-display text-3xl font-bold text-royal">
              Write a review
            </h3>
            <p className="mt-1 text-center text-xs text-neutral-500">
              Koi bhi review de sakta hai, login zaruri nahi. Aapki email
              website par nahi dikhai jati.
            </p>

            <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
              <div
                className="flex gap-1.5"
                onMouseLeave={() => setHover(0)}
                role="radiogroup"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                    className="transition duration-200 hover:scale-125 active:scale-90"
                  >
                    <Star
                      size={36}
                      className={`transition duration-200 ${n <= active ? "fill-gold-500 text-gold-500" : "text-gold-200"}`}
                    />
                  </button>
                ))}
              </div>
              <span className="min-h-5 text-sm font-semibold text-gold-600">
                {LABELS[active]}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="rv-name">
                  Your name
                </label>
                <input
                  id="rv-name"
                  className="field"
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!!user}
                  autoComplete="name"
                  placeholder="e.g. Ali"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="rv-email">
                  Your email
                </label>
                <input
                  id="rv-email"
                  type="email"
                  className="field"
                  value={email}
                  maxLength={120}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!user}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label" htmlFor="rv-comment">
                Your review
              </label>
              <textarea
                id="rv-comment"
                rows={5}
                maxLength={1500}
                className="field"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Product kaisa laga? Taste, quality, delivery..."
              />
            </div>

            <div className="mt-4">
              <label className="label">Photos (max {MAX_PHOTOS})</label>
              <div className="flex flex-wrap gap-2.5">
                {photos.map((u, k) => (
                  <div
                    key={u}
                    className="group relative h-16 w-16 animate-pop overflow-hidden rounded-2xl border border-gold-200 sm:h-20 sm:w-20"
                  >
                    <img
                      src={cld(u, "f_auto,q_auto,w_160,h_160,c_fill")}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((p) => p.filter((_, x) => x !== k))
                      }
                      aria-label="Remove photo"
                      className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-[#060607]/80 text-white transition hover:scale-110"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {Array.from({ length: uploading }).map((_, k) => (
                  <div
                    key={k}
                    className="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-gold-300 bg-gold-50 sm:h-20 sm:w-20"
                  >
                    <div className="ring-loader ring-loader-sm" />
                  </div>
                ))}
                {photos.length + uploading < MAX_PHOTOS && (
                  <label className="group grid h-16 w-16 cursor-pointer place-items-center rounded-2xl border border-dashed border-gold-300 text-gold-600 transition duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-50 hover:shadow-md sm:h-20 sm:w-20">
                    <Camera
                      size={22}
                      className="transition duration-300 group-hover:scale-110"
                    />
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => pick(e.target.files)}
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              disabled={busy || uploading > 0}
              className="btn-gold mt-6 w-full !py-3.5"
            >
              <Send size={16} />
              {busy
                ? "Posting…"
                : uploading
                  ? "Uploading photos…"
                  : "Post review"}
            </button>
          </form>
        )}

        {/* Reviews list */}
        <div className="space-y-4 pt-2">
          {list.slice(0, shown).map((r, k) => (
            <article
              key={r.id}
              style={{ animationDelay: `${Math.min(k, 5) * 60}ms` }}
              className="group animate-rowIn rounded-3xl border border-gold-100 bg-white p-4 transition duration-500 hover:-translate-y-1 hover:border-champ-300 hover:shadow-xl hover:shadow-champ-200/40 sm:p-6"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#060607] via-[#0a3a78] to-[#1d7fe0] text-lg font-bold text-white transition duration-500 group-hover:rotate-6 group-hover:scale-110 sm:h-12 sm:w-12">
                  {(r.name || "G").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <div className="truncate font-semibold text-royal">
                      {r.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {fmtDate(r.created_at)}
                    </div>
                  </div>
                  <Stars value={r.rating} size={15} className="mt-1" />
                </div>
                {r.can_delete && (
                  <button
                    onClick={() => del(r)}
                    aria-label="Delete review"
                    title="Delete"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-red-200 text-red-600 transition hover:scale-110 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              {r.comment && (
                <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed text-neutral-600">
                  {r.comment}
                </p>
              )}
              {r.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {r.images.map((u, x) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setLb({ images: r.images, start: x })}
                      aria-label="View photo"
                      className="group/p h-20 w-20 cursor-zoom-in overflow-hidden rounded-2xl border border-gold-100 transition duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg sm:h-24 sm:w-24"
                    >
                      <img
                        src={cld(u, "f_auto,q_auto,w_220,h_220,c_fill")}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover/p:scale-110"
                      />
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}

          {list.length > shown && (
            <button
              onClick={() => setShown((s) => s + 5)}
              className="btn-line w-full"
            >
              Show more reviews ({list.length - shown})
            </button>
          )}
        </div>
      </div>

      {lb && (
        <Lightbox
          images={lb.images}
          start={lb.start}
          alt="Review photo"
          onClose={() => setLb(null)}
        />
      )}
    </section>
  );
}
