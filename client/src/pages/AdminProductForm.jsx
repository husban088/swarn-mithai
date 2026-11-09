import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { uploadDirect, uploadMany } from "../lib/upload";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Package,
  Sparkles,
  Star,
  Tag,
  Trash2,
  UploadCloud,
  Video,
  Wallet,
  X,
} from "lucide-react";
import Thumb from "../components/Thumb";
import Reveal from "../components/Reveal";
import { api, json } from "../lib/api";
import { CATEGORIES, SHOP_INFO } from "../config";
import { fmtMoney } from "../lib/format";
import { cld, cldVideo, imagesOf } from "../lib/img";
import { useShop, useToast } from "../store";
import { useAdminScope } from "../lib/adminScope";

const MAX_IMAGES = 8;
const RECOMMENDED_IMAGES = 5;
const VAR_MAX_IMAGES = 5; // har option / box ki max images

const EMPTY = {
  name: "",
  description: "",
  category: "sweets",
  image_url: "",
  images: [],
  video_url: "",
  price_usd: "",
  price_pkr: "",
  variants: [],
  unit: "",
  featured: false,
  in_stock: true,
};

// Naye mithai product me 2 box options khud bhar jate hain (config.js -> SHOP_INFO.boxes): Signature $12 + Special Box $20
const defaultBoxes = () =>
  SHOP_INFO.boxes.map((b) => ({
    ...b,
    price_pkr: "",
    image: "",
    images: [],
  }));

function Section({ icon: Icon, title, hint, children, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <section className="group rounded-3xl border border-gold-100 bg-white p-5 shadow-sm transition duration-500 hover:border-champ-300 hover:shadow-xl hover:shadow-champ-200/40 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#060607] via-[#0a3a78] to-[#1d7fe0] text-white shadow-lg shadow-gold-500/30 transition duration-500 group-hover:rotate-6 group-hover:scale-110">
            <Icon size={19} />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold leading-none text-royal">
              {title}
            </h2>
            {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
          </div>
        </div>
        {children}
      </section>
    </Reveal>
  );
}

// Product add / edit ka alag page (modal nahi).
// Routes: /admin/products/new  aur  /admin/products/:id/edit
export default function AdminProductForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const toast = useToast();
  const { reload, rate } = useShop();
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const sc = useAdminScope();
  const fRef = useRef(EMPTY);

  // Admin sirf apni category ka product bana sakta hai (Pakistan = water, USA = mithai)
  const [f, setF] = useState(() => {
    const category = sc.category || "sweets";
    return {
      ...EMPTY,
      category,
      variants: !editing && category === "sweets" ? defaultBoxes() : [],
    };
  });
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);
  const [drag, setDrag] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [vUp, setVUp] = useState(false);
  const [pvI, setPvI] = useState(0); // live preview me kaun sa option dikh raha hai
  const [pvK, setPvK] = useState(0); // us option ki kaun si image

  fRef.current = f;
  const aqua = f.category === "aqua";
  const set = (k) => (e) =>
    setF((s) => ({
      ...s,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  // Edit mode: product load karo
  useEffect(() => {
    if (!editing) return;
    let alive = true;
    (async () => {
      try {
        const r = await api("/admin/products");
        const p = r.products.find((x) => x.id === id);
        if (!p) {
          toast("Product not found", "err");
          nav("/admin?tab=products", { replace: true });
          return;
        }
        if (alive)
          setF({
            ...EMPTY,
            ...p,
            category: sc.category || p.category,
            description: p.description || "",
            unit: p.unit || "",
            image_url: p.image_url || "",
            images: imagesOf(p),
            video_url: p.video_url || "",
            price_usd: p.price_usd ?? "",
            price_pkr: p.price_pkr ?? "",
            variants: Array.isArray(p.variants)
              ? p.variants.map((v) => ({
                  ...v,
                  images:
                    Array.isArray(v.images) && v.images.length
                      ? v.images
                      : v.image
                        ? [v.image]
                        : [],
                }))
              : [],
          });
      } catch (e) {
        toast(e.message, "err");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // images list badalne ka ek hi raasta: pehli image hamesha cover (image_url) hoti hai
  const setImages = (fn) =>
    setF((s) => {
      const images = fn(s.images || []).slice(0, MAX_IMAGES);
      return { ...s, images, image_url: images[0] || "" };
    });

  // Saari images ek saath (3 parallel) aur browser me chhoti ho kar upload hoti hain: pehle se kai guna tez
  const uploadFiles = async (fileList) => {
    let files = [...(fileList || [])];
    if (!files.length) return;
    const bad = files.filter((x) => !/^image\//.test(x.type));
    if (bad.length) toast("Only image files", "err");
    files = files.filter((x) => /^image\//.test(x.type));
    const room = MAX_IMAGES - (fRef.current.images || []).length;
    if (files.length > room) toast(`Maximum ${MAX_IMAGES} images`, "err");
    files = files.slice(0, Math.max(0, room));
    if (!files.length) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUp(true);
    const res = await uploadMany(files, { signPath: "/admin/upload-sign" });
    const urls = res.filter((r) => r?.ok).map((r) => r.url);
    if (urls.length) {
      setImages((l) => [...l, ...urls.filter((u) => !l.includes(u))]);
      toast(urls.length > 1 ? `${urls.length} images uploaded` : "Image uploaded");
    }
    const fail = res.find((r) => r && !r.ok);
    if (fail) toast(fail.error, "err");
    setUp(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadVideoFile = async (file) => {
    if (!file) return;
    if (!/^video\//.test(file.type)) return toast("Only video files", "err");
    if (file.size > 60 * 1024 * 1024)
      return toast("Video 60 MB se choti honi chahiye", "err");
    setVUp(true);
    try {
      const r = await uploadDirect(file, {
        signPath: "/admin/upload-sign",
        kind: "video",
      });
      setF((x) => ({ ...x, video_url: r.url }));
      toast("Video uploaded");
    } catch (err) {
      toast(err.message, "err");
    }
    setVUp(false);
    if (videoRef.current) videoRef.current.value = "";
  };

  // Special Box ka ready-made preset (naam, description, unit, price bhar deta hai)
  const fillSpecialBox = () => {
    const b = SHOP_INFO.special.box;
    setF((x) => ({
      ...x,
      name: `Special Event Box (${b.pieces} pcs)`,
      description: `${SHOP_INFO.special.text} Choose ${b.pieces} pieces from our 20 varieties.`,
      category: "sweets",
      unit: `Box (${b.pieces} pcs)`,
      price_usd: b.price,
      variants: [],
      featured: true,
    }));
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!/^https?:\/\//.test(u))
      return toast("Valid image URL paste karein", "err");
    setImages((l) => (l.includes(u) ? l : [...l, u]));
    setUrlInput("");
  };
  // ---- Options (variants): Pure / Mix / Custom 50 PET, ya First time / Refill ----
  const [vImgUp, setVImgUp] = useState(-1);
  const setVar = (i, patch) =>
    setF((s) => ({
      ...s,
      variants: (s.variants || []).map((v, k) =>
        k === i ? { ...v, ...patch } : v,
      ),
    }));
  const addVar = () =>
    setF((s) => ({
      ...s,
      variants: [
        ...(s.variants || []),
        {
          key: "",
          label: "",
          price_pkr: "",
          price_usd: "",
          note: "",
          image: "",
          images: [],
        },
      ].slice(0, 6),
    }));
  const delVar = (i) =>
    setF((s) => ({
      ...s,
      variants: (s.variants || []).filter((_, k) => k !== i),
    }));
  // Har option ki images list (purani single image bhi shamil)
  const varImgs = (v) =>
    Array.isArray(v?.images) && v.images.length
      ? v.images
      : v?.image
        ? [v.image]
        : [];
  const setVarImgs = (i, fn) =>
    setF((s) => ({
      ...s,
      variants: (s.variants || []).map((v, k) => {
        if (k !== i) return v;
        const images = fn(varImgs(v)).slice(0, VAR_MAX_IMAGES);
        return { ...v, images, image: images[0] || "" };
      }),
    }));
  const uploadVarImgs = async (i, fileList) => {
    let files = [...(fileList || [])];
    if (!files.length) return;
    const bad = files.filter((x) => !/^image\//.test(x.type));
    if (bad.length) toast("Only image files", "err");
    files = files.filter((x) => /^image\//.test(x.type));
    const room =
      VAR_MAX_IMAGES - varImgs(fRef.current.variants?.[i]).length;
    if (files.length > room)
      toast(`Har option ki max ${VAR_MAX_IMAGES} images`, "err");
    files = files.slice(0, Math.max(0, room));
    if (!files.length) return;
    setVImgUp(i);
    const res = await uploadMany(files, { signPath: "/admin/upload-sign" });
    const urls = res.filter((r) => r?.ok).map((r) => r.url);
    if (urls.length) {
      setVarImgs(i, (l) => [...l, ...urls.filter((u) => !l.includes(u))]);
      toast(
        urls.length > 1
          ? `${urls.length} option images uploaded`
          : "Option image uploaded",
      );
    }
    const fail = res.find((r) => r && !r.ok);
    if (fail) toast(fail.error, "err");
    setVImgUp(-1);
  };
  const removeVarImg = (i, idx) =>
    setVarImgs(i, (l) => l.filter((_, k) => k !== idx));
  const coverVarImg = (i, idx) =>
    setVarImgs(i, (l) => [l[idx], ...l.filter((_, k) => k !== idx)]);
  // key label se banti hai (pure, mix, first-time ...), duplicate na ho
  const cleanVars = () => {
    const used = new Set();
    return (f.variants || [])
      .filter((v) => String(v.label || "").trim())
      .map((v, i) => {
        let k =
          String(v.key || "")
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "") ||
          String(v.label)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 30) ||
          `opt${i + 1}`;
        while (used.has(k)) k += "x";
        used.add(k);
        const imgs = varImgs(v);
        return {
          ...v,
          images: imgs,
          image: imgs[0] || "",
          key: k,
          price_pkr:
            v.price_pkr === "" || v.price_pkr == null
              ? null
              : Number(v.price_pkr),
          price_usd:
            v.price_usd === "" || v.price_usd == null
              ? null
              : Number(v.price_usd),
        };
      });
  };

  const makeCover = (idx) =>
    setImages((l) => [l[idx], ...l.filter((_, k) => k !== idx)]);
  const removeImg = (idx) => setImages((l) => l.filter((_, k) => k !== idx));

  const save = async (e) => {
    e.preventDefault();
    const variants = cleanVars();
    const pk = aqua ? "price_pkr" : "price_usd";
    if (variants.some((v) => !Number.isFinite(v[pk]) || v[pk] < 0))
      return toast(
        `Har option ki valid ${aqua ? "PKR" : "USD"} price likhein`,
        "err",
      );
    // Options hon to product ki base images = pehle option ki images (cart / fallback ke liye)
    const baseImgs = variants.length
      ? variants.find((v) => v.images?.length)?.images || f.images || []
      : f.images || [];
    setBusy(true);
    try {
      await api(
        editing ? `/admin/products/${id}` : "/admin/products",
        json(editing ? "PUT" : "POST", {
          ...f,
          variants,
          price_usd:
            !aqua && variants.length ? variants[0].price_usd : f.price_usd,
          images: baseImgs,
          image_url: baseImgs[0] || "",
        }),
      );
      toast(editing ? "Product updated" : "Product added");
      reload();
      nav("/admin?tab=products");
    } catch (err) {
      toast(err.message, "err");
      setBusy(false);
    }
  };

  const del = async () => {
    if (!window.confirm(`Delete "${f.name}"? This cannot be undone.`)) return;
    try {
      await api(`/admin/products/${id}`, { method: "DELETE" });
      toast("Product deleted");
      reload();
      nav("/admin?tab=products");
    } catch (err) {
      toast(err.message, "err");
    }
  };

  // Live preview: chuna hua option, uski images aur price
  const pvVars = f.variants || [];
  const pv = pvVars[Math.min(pvI, Math.max(0, pvVars.length - 1))] || null;
  const pvImgs = pv && varImgs(pv).length ? varImgs(pv) : f.images || [];
  const pvShow = pvImgs[Math.min(pvK, Math.max(0, pvImgs.length - 1))];
  const pvPkr = pv ? pv.price_pkr : f.price_pkr;
  const pvUsd = pv ? pv.price_usd : f.price_usd;

  if (loading) {
    return (
      <div className="container-x py-12">
        <div className="h-12 w-72 animate-pulse rounded-xl bg-gold-50" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-96 animate-pulse rounded-3xl bg-gold-50" />
          <div className="h-96 animate-pulse rounded-3xl bg-gold-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10 sm:py-12">
      <Link
        to="/admin?tab=products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition hover:gap-3 hover:text-royal"
      >
        <ArrowLeft size={16} /> Back to products
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="animate-rise">
          <span className="eyebrow">Admin · Products</span>
          <h1 className="mt-2 font-display text-5xl font-bold leading-tight text-royal sm:text-6xl">
            {editing ? "Edit product" : "Add product"}
          </h1>
        </div>
        {editing && (
          <button
            type="button"
            onClick={del}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md"
          >
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>

      <form
        onSubmit={save}
        className="mt-8 grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]"
      >
        {/* Left: form sections */}
        <div className="space-y-6">
          {!aqua && (
            <Reveal>
              <div className="grain relative overflow-hidden rounded-3xl bg-royal p-5 text-champ-100 sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-glow rounded-full bg-champ-400/30 blur-3xl" />
                <div className="relative flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-champ-300">
                      Store info (website par dikhta hai)
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed">
                      {SHOP_INFO.delivery.title}. {SHOP_INFO.delivery.note}{" "}
                      {SHOP_INFO.special.title}: {SHOP_INFO.special.text}{" "}
                      <b className="text-white">
                        {SHOP_INFO.special.box.name} $
                        {SHOP_INFO.special.box.price} ·{" "}
                        {SHOP_INFO.special.box.pieces} pieces.
                      </b>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fillSpecialBox}
                    className="btn-champ !px-5 !py-2.5"
                  >
                    <Sparkles size={15} /> Fill Special Box
                  </button>
                </div>
              </div>
            </Reveal>
          )}

          <Section
            icon={Package}
            title="Basic details"
            hint="Name, description aur category"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Name</label>
                <input
                  className="field"
                  value={f.name}
                  onChange={set("name")}
                  placeholder="e.g. Kaju Katli"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea
                  rows={5}
                  className="field"
                  value={f.description}
                  onChange={set("description")}
                  placeholder="Product ki poori detail likhein (ye modal me bhi dikhegi)"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="field"
                  value={f.category}
                  onChange={set("category")}
                  disabled
                >
                  <option value={f.category}>
                    {CATEGORIES[f.category]?.label} · {sc.brand}
                  </option>
                </select>
              </div>
              <div>
                <label className="label">Unit (e.g. Box 500 g)</label>
                <input
                  className="field"
                  value={f.unit}
                  onChange={set("unit")}
                  placeholder="Box (500 g)"
                />
              </div>
            </div>
          </Section>

          <Section
            icon={Wallet}
            title="Pricing"
            hint={
              aqua
                ? "Evelyn One: sirf PKR price likhein"
                : "Mithai House: sirf USD price likhein"
            }
            delay={80}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {!aqua && (
                <div>
                  <label className="label">Price in USD (USA)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field"
                    value={
                      (f.variants || []).length
                        ? (f.variants[0]?.price_usd ?? "")
                        : f.price_usd
                    }
                    onChange={set("price_usd")}
                    disabled={(f.variants || []).length > 0}
                    placeholder="0.00"
                    required={!(f.variants || []).length}
                  />
                  {(f.variants || []).length > 0 && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Boxes hon to pehle box ki price hi product ki price hai.
                    </p>
                  )}
                </div>
              )}
              {aqua && (
                <div>
                  <label className="label">Price in PKR (Pakistan)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="field"
                    value={
                      (f.variants || []).length
                        ? (f.variants[0]?.price_pkr ?? "")
                        : f.price_pkr
                    }
                    onChange={set("price_pkr")}
                    disabled={(f.variants || []).length > 0}
                    placeholder="0"
                    required={!(f.variants || []).length}
                  />
                  {(f.variants || []).length > 0 && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Options hon to pehle option ki price hi product ki price
                      hai.
                    </p>
                  )}
                </div>
              )}
            </div>

            {
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="label !mb-0">
                      {aqua
                        ? "Options (Pure / Mix / Refill ...)"
                        : "Boxes (Signature Box $12 / Special Box $20)"}
                    </span>
                    <p className="text-xs text-neutral-500">
                      {aqua
                        ? "Har option ki apni price + alag images (5 tak). Card par image ke neeche chips dikhte hain, jo chuna jaye uski image aur price dikhti hai."
                        : "Har box ki apni price + alag images (5 tak, Signature aur Special Box ki alag alag). Card par image ke neeche 2 buttons dikhte hain; jo chuna jaye uski image aur price dikhti hai. Special Box ki image upload na karein to default gift-box image lagti hai."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!aqua && (
                      <button
                        type="button"
                        onClick={() =>
                          setF((s) => ({
                            ...s,
                            variants: (s.variants || []).length
                              ? s.variants
                              : defaultBoxes(),
                          }))
                        }
                        disabled={(f.variants || []).length > 0}
                        className="btn-line !px-4 !py-2 text-xs"
                      >
                        Use default boxes ($12 / $20)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addVar}
                      disabled={(f.variants || []).length >= 6}
                      className="btn-champ !px-4 !py-2 text-xs"
                    >
                      {aqua ? "+ Add option" : "+ Add box"}
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {(f.variants || []).map((v, i) => (
                    <div
                      key={i}
                      className="grid gap-3 rounded-2xl border border-gold-200 bg-gold-50/40 p-3 sm:grid-cols-[1fr_130px_auto]"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          className="field"
                          value={v.label}
                          onChange={(e) => setVar(i, { label: e.target.value })}
                          placeholder={
                            aqua ? "Name e.g. Pure" : "Name e.g. Signature Box"
                          }
                        />
                        <input
                          type="number"
                          min="0"
                          step={aqua ? "1" : "0.01"}
                          className="field"
                          value={aqua ? v.price_pkr : (v.price_usd ?? "")}
                          onChange={(e) =>
                            setVar(
                              i,
                              aqua
                                ? { price_pkr: e.target.value }
                                : { price_usd: e.target.value },
                            )
                          }
                          placeholder={aqua ? "PKR price" : "USD price"}
                        />
                        <input
                          className="field sm:col-span-2"
                          value={v.note || ""}
                          onChange={(e) => setVar(i, { note: e.target.value })}
                          placeholder={
                            aqua
                              ? "Note (optional) e.g. Minimum order 50 PET bottles"
                              : "Note (optional) e.g. Gift-ready · 16 pcs"
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => delVar(i)}
                        aria-label="Remove option"
                        className="grid h-10 w-10 place-items-center self-start rounded-full border border-red-200 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className="sm:col-span-2">
                        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                          <span>
                            {v.label || "Option"} ki images ({varImgs(v).length}
                            /{VAR_MAX_IMAGES}) · pehli image cover
                          </span>
                          {vImgUp === i && (
                            <span className="text-gold-600">Uploading…</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {varImgs(v).map((u, idx) => (
                            <div
                              key={u}
                              className="group/vi relative aspect-square overflow-hidden rounded-xl border border-champ-200 bg-white"
                            >
                              <img
                                src={cld(u, "f_auto,q_auto,w_300")}
                                alt=""
                                className="h-full w-full object-contain"
                              />
                              {idx === 0 && (
                                <span className="absolute left-1 top-1 rounded-full bg-[#060607]/80 px-2 py-0.5 text-[9px] font-bold text-white">
                                  Cover
                                </span>
                              )}
                              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover/vi:opacity-100">
                                {idx !== 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => coverVarImg(i, idx)}
                                    className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-royal"
                                  >
                                    Cover
                                  </button>
                                ) : (
                                  <span />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeVarImg(i, idx)}
                                  aria-label="Remove image"
                                  className="grid h-5 w-5 place-items-center rounded-full bg-red-600 text-white"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {varImgs(v).length < VAR_MAX_IMAGES && (
                            <label className="grid aspect-square cursor-pointer whitespace-pre-line place-items-center rounded-xl border border-dashed border-champ-300 bg-white p-1 text-center text-[10px] font-semibold text-neutral-500 transition hover:border-gold-500 hover:bg-gold-50">
                              {vImgUp === i
                                ? "Uploading…"
                                : (v.key === "special-box" ||
                                      /special/i.test(v.label || "")) &&
                                    !aqua &&
                                    !varImgs(v).length
                                  ? "+ Add images\n(default box image\nlagti hai)"
                                  : "+ Add images\n(multiple select)"}
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  uploadVarImgs(i, e.target.files);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!(f.variants || []).length && (
                    <p className="rounded-2xl bg-gold-50 p-4 text-sm text-neutral-500">
                      {aqua
                        ? "Koi option nahi. Sirf ek hi price wala product ho to upar PKR price kaafi hai."
                        : "Koi box option nahi. Sirf ek hi price wala product ho to upar USD price kaafi hai."}
                    </p>
                  )}
                </div>
              </div>
            }
          </Section>

          {pvVars.length === 0 ? (
            <Section
              icon={ImagePlus}
              title="Images"
              hint={`Har product ki ${RECOMMENDED_IMAGES} HD images lagayein · pehli image cover hogi · poori image dikhti hai, stretch nahi hoti (max ${MAX_IMAGES})`}
              delay={140}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  uploadFiles(e.dataTransfer.files);
                }}
                className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition duration-300 ${drag ? "scale-[1.01] border-gold-500 bg-gold-50" : "border-gold-200 hover:border-champ-400 hover:bg-gold-50/50"}`}
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#060607] to-gold-600 text-white">
                  <UploadCloud
                    size={24}
                    className={up ? "animate-bounce" : ""}
                  />
                </span>
                <p className="text-sm text-neutral-600">
                  Images yahan drag karein ya
                </p>
                <p
                  className={`rounded-full px-3 py-1 text-xs font-bold ${f.images.length >= RECOMMENDED_IMAGES ? "bg-champ-100 text-champ-600" : "bg-amber-50 text-amber-700"}`}
                >
                  {f.images.length}/{RECOMMENDED_IMAGES} recommended images
                </p>
                <label className="btn-line cursor-pointer !py-2.5">
                  <ImagePlus size={16} />
                  {up ? "Uploading…" : "Choose images"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => uploadFiles(e.target.files)}
                    disabled={up}
                  />
                </label>
              </div>

              {(f.images.length > 0 || up) && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {f.images.map((u, idx) => (
                    <div
                      key={u + idx}
                      className="group relative aspect-square animate-pop overflow-hidden rounded-2xl border border-gold-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <img
                        src={cld(u, "f_auto,q_auto,w_300,h_300,c_fill")}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      {idx === 0 ? (
                        <span className="absolute left-1.5 top-1.5 rounded-full champ-bg px-2 py-0.5 text-[10px] font-bold text-royal shadow">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeCover(idx)}
                          title="Make cover"
                          aria-label="Make cover"
                          className="absolute left-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-[#060607]/80 text-white transition hover:scale-110 hover:bg-gold-600 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Star size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImg(idx)}
                        title="Remove"
                        aria-label="Remove image"
                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-[#060607]/80 text-white transition hover:scale-110 hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {up && (
                    <div className="grid aspect-square place-items-center rounded-2xl border border-dashed border-gold-300 bg-gold-50">
                      <div className="ring-loader ring-loader-sm" />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <input
                  className="field"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                  placeholder="or paste image URL"
                />
                <button
                  type="button"
                  onClick={addUrl}
                  className="btn-line shrink-0 !py-2.5"
                >
                  Add
                </button>
              </div>
            </Section>
          ) : (
            <div className="rounded-3xl border border-dashed border-gold-200 bg-gold-50/50 p-5 text-sm text-neutral-600">
              <b className="text-royal">Images:</b> is product me options hain,
              isliye images har option ke andar (upar Options / Boxes me) add
              hoti hain. Right side preview me option chuna kar har option ki
              images dekh sakte hain.
            </div>
          )}

          <Section
            icon={Video}
            title="Video"
            hint="Product ki ek video (MP4 / WEBM / MOV, max 60 MB). Product page par images ke saath chalti hai"
            delay={170}
          >
            {f.video_url ? (
              <div className="space-y-3">
                <div className="aspect-video overflow-hidden rounded-2xl bg-[#060607]">
                  <video
                    key={f.video_url}
                    src={cldVideo(f.video_url)}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setF((x) => ({ ...x, video_url: "" }))}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50"
                >
                  <Trash2 size={15} /> Remove video
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gold-200 p-6 text-center transition duration-300 hover:border-champ-400 hover:bg-gold-50/50">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#060607] to-gold-600 text-white">
                  <Video size={24} className={vUp ? "animate-pulse" : ""} />
                </span>
                <span className="text-sm text-neutral-600">
                  {vUp
                    ? "Uploading video… thora wait karein"
                    : "Choose a video"}
                </span>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  disabled={vUp}
                  onChange={(e) => uploadVideoFile(e.target.files?.[0])}
                />
              </label>
            )}
          </Section>

          <Section
            icon={Tag}
            title="Visibility"
            hint="Bestseller badge aur stock"
            delay={200}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["featured", "Show as bestseller"],
                ["in_stock", "In stock"],
              ].map(([k, label]) => (
                <label
                  key={k}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${f[k] ? "border-gold-400 bg-gold-50 text-royal" : "border-gold-100 text-neutral-600"}`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#135fb8]"
                    checked={f[k]}
                    onChange={set(k)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </Section>
        </div>

        {/* Right: live preview + save (desktop par sticky) */}
        <div className="space-y-5 lg:sticky lg:top-28">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-gold-100 bg-white shadow-xl shadow-champ-200/40">
              <div className="flex items-center gap-2 bg-royal px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-champ-200">
                <Sparkles size={14} /> Live preview
              </div>
              <div className="group relative aspect-[4/3] overflow-hidden bg-gold-50">
                <Thumb
                  key={pvShow || "none"}
                  p={{
                    ...f,
                    variants: [],
                    images: pvShow ? [pvShow] : [],
                    image_url: pvShow || "",
                    name: f.name || "preview",
                  }}
                />
                {f.featured && (
                  <span className="absolute left-3 top-3 rounded-full champ-bg px-3 py-1 text-[11px] font-bold text-royal shadow">
                    Bestseller
                  </span>
                )}
                {f.video_url && (
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-[#060607]/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <Video size={11} /> Video added
                  </span>
                )}
                {!f.in_stock && (
                  <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-bold text-royal">
                    Out of stock
                  </div>
                )}
              </div>
              {pvVars.some((v) => v.label) && (
                <div className="flex gap-2 overflow-x-auto border-b border-gold-100 bg-white px-4 py-3">
                  {pvVars.map((v, i) => {
                    const im = varImgs(v)[0];
                    const on = pv === v;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setPvI(i);
                          setPvK(0);
                        }}
                        className={`flex shrink-0 items-center gap-2 rounded-2xl border p-1.5 pr-3 text-left text-xs font-semibold transition ${on ? "border-gold-500 bg-gold-50 text-royal shadow" : "border-gold-200 text-neutral-600 hover:bg-gold-50"}`}
                      >
                        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white">
                          {im ? (
                            <img
                              src={cld(im, "f_auto,q_auto,w_120")}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-[9px] text-neutral-400">
                              No img
                            </span>
                          )}
                        </span>
                        <span>
                          <span className="block">{v.label || "Option"}</span>
                          <span className="block text-[10px] font-normal text-neutral-500">
                            {varImgs(v).length} image
                            {varImgs(v).length === 1 ? "" : "s"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {pvImgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-b border-gold-100 bg-white px-4 py-3">
                  {pvImgs.map((u, k) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setPvK(k)}
                      className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-white transition ${pvShow === u ? "border-gold-500 shadow ring-2 ring-gold-200" : "border-gold-200 opacity-80 hover:opacity-100"}`}
                    >
                      <img
                        src={cld(u, "f_auto,q_auto,w_120")}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
                  {CATEGORIES[f.category]?.label}
                </div>
                <h3 className="mt-1 font-display text-3xl font-bold leading-tight text-royal">
                  {f.name || "Product name"}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-sm text-neutral-500">
                  {f.description || "Description yahan dikhegi."}
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
                  <div>
                    <div className="text-xl font-extrabold text-royal">
                      {aqua
                        ? fmtMoney(pvPkr || 0, "PKR")
                        : `≈ ${fmtMoney((pvUsd || 0) * (rate?.pkrPerUsd || 280), "PKR")}`}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {aqua ? "Pakistan" : "Pakistan (live rate)"}
                    </div>
                  </div>
                  {!aqua && (
                    <div>
                      <div className="text-xl font-extrabold text-royal">
                        {fmtMoney(pvUsd || 0, "USD")}
                      </div>
                      <div className="text-xs text-neutral-500">USA</div>
                    </div>
                  )}
                  <div className="ml-auto text-xs text-neutral-500">
                    {f.unit}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <button
            disabled={busy || up || vUp || vImgUp >= 0}
            className="btn-gold w-full !py-4 text-base"
          >
            {busy ? (
              "Saving…"
            ) : (
              <>
                <Check size={18} />
                {editing ? "Save changes" : "Add product"}
              </>
            )}
          </button>
          <Link
            to="/admin?tab=products"
            className="btn-line w-full !py-3.5 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
