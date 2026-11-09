// Cloudinary URL me transformation (size/quality) lagata hai, taake images tez load hon.
// Cloudinary ke ilawa kisi aur URL ko jaisa hai waisa hi wapis karta hai.
export const cld = (url, t = "f_auto,q_auto") => {
  if (!url || !/res\.cloudinary\.com\/.+\/image\/upload\//.test(url))
    return url;
  return url.replace("/image/upload/", `/image/upload/${t}/`);
};

// Product ki saari images ki list (images, warna purani image_url)
export const imagesOf = (p) =>
  Array.isArray(p?.images) && p.images.length
    ? p.images
    : p?.image_url
      ? [p.image_url]
      : [];

// Product ki video (agar upload ki ho)
export const videoOf = (p) =>
  typeof p?.video_url === "string" && /^https?:\/\//.test(p.video_url)
    ? p.video_url
    : null;

const isCldVideo = (u) =>
  /res\.cloudinary\.com\/.+\/video\/upload\//.test(u || "");

// Cloudinary video ka pehla frame (poster image)
export const videoPoster = (url, w = 1200) =>
  isCldVideo(url)
    ? url
        .replace("/video/upload/", `/video/upload/so_0,f_jpg,q_auto,w_${w}/`)
        .replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg")
    : null;

// Cloudinary video ko auto quality ke saath chalata hai
export const cldVideo = (url) =>
  isCldVideo(url)
    ? url.replace("/video/upload/", "/video/upload/q_auto/")
    : url;

// Backdrop ke liye bohat chhoti image (CSS blur filter ki jagah): tez aur scroll smooth rehta hai.
// Cloudinary -> 32px version, /hero/x.jpg -> /hero/blur/x.jpg. Aur koi URL ho to null (tab halka blur lagta hai).
export const tinyOf = (url) => {
  if (!url) return null;
  if (/res\.cloudinary\.com\/.+\/image\/upload\//.test(url))
    return cld(url, "f_auto,q_auto:low,w_32");
  const m = /^\/hero\/([^/]+\.jpe?g)$/.exec(url);
  return m ? `/hero/blur/${m[1]}` : null;
};

// Card / gallery image ka exact URL (FitImage aur prefetch dono yahi use karte hain,
// taake prefetch ki hui image browser cache se foran mile aur dobara download na ho).
export const fitUrl = (src, w = 700) =>
  cld(src, `f_auto,q_auto:good,w_${w},c_limit`);

// Images ko pehle se (idle time me) download kar leta hai, taake page kholte hi sharp dikhein.
const warmed = new Set();
export function prefetchImages(urls) {
  if (typeof window === "undefined") return;
  const run = () =>
    urls.forEach((u) => {
      if (!u || warmed.has(u)) return;
      warmed.add(u);
      const im = new Image();
      im.decoding = "async";
      im.src = u;
    });
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1500 });
  else setTimeout(run, 300);
}
