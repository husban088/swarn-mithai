import { imagesOf } from "./img";
import { SPECIAL_BOX_IMAGE, SPECIAL_BOX_KEY } from "../config";

// Variants: water products ke options (Pure / Mix / Custom, ya First time / Refill).
// Har option ki apni price, note aur image hoti hai.
export const variantsOf = (p) => (Array.isArray(p?.variants) ? p.variants : []);

export const pickVariant = (p, key) => {
  const list = variantsOf(p);
  return list.find((v) => v.key === key) || list[0] || null;
};

// Product ko chune hue option ke hisaab se dikhao (price + image + note badal jati hain)
// Option ki image: admin ne upload ki ho wahi, warna Special Box ki default image
export const variantImage = (p, v) =>
  v?.images?.[0] ||
  v?.image ||
  (p?.category === "sweets" && v?.key === SPECIAL_BOX_KEY
    ? SPECIAL_BOX_IMAGE
    : "");

export const viewOf = (p, key) => {
  const v = pickVariant(p, key);
  if (!v) return p;
  const base = imagesOf(p);
  const vi = variantImage(p, v);
  // Option ki apni images hon to sirf wahi dikhti hain (har option ki alag gallery)
  const own = Array.isArray(v.images) && v.images.length ? v.images : null;
  const images = own || (vi ? [vi, ...base.filter((u) => u !== vi)] : base);
  return {
    ...p,
    price: v.price,
    original_price: v.original_price ?? v.price,
    images,
    image_url: images[0] || p.image_url,
    unit: v.note || p.unit,
  };
};

// Cart line ki unique key
export const lineKey = (pid, v) => (v ? `${pid}~${v}` : pid);
