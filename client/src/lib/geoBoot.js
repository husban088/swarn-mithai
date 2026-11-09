// index.html ki boot script ne jo country pehchani (window.__geo), uska chhota helper.
// Splash (React load hone ke baad ka loading screen) aur detectCountry isi se wahi logo/country lete hain.
export const bootCode = () => (window.__geo && window.__geo.code) || null;

export function onBootCode(cb) {
  const g = window.__geo;
  if (!g || !g.promise) return () => {};
  let off = false;
  g.promise.then((r) => !off && cb(r.code));
  return () => {
    off = true;
  };
}

// Pehli dafa boot script ka asli (IP wala) jawab; baad me (VPN badalne par) null -> naya detect chale
let consumed = false;
export async function takeBootResult() {
  const g = window.__geo;
  if (consumed || !g || !g.promise) return null;
  consumed = true;
  const r = await g.promise;
  return r && r.real ? r.code : null;
}
