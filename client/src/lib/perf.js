// Speed helpers (poori site par): koi component badalne ki zaroorat nahi.
//
// 1) Jo section screen se bahar hai uski sab CSS animations ruk jati hain (ghoomte ring, glow, marquee, ken-burns).
//    Screen ke paas aate hi (150px pehle) wapis chalti hain. Isse scroll par GPU/CPU ka bojh bohat kam ho jata hai.
// 2) Glow wale blur blobs apni alag layer par chalte hain (opacity animation sasti ho jati hai).
let started = false;

export function initPerf() {
  if (started || typeof window === "undefined") return;
  started = true;

  const css = document.createElement("style");
  css.setAttribute("data-perf", "1");
  css.textContent = `
[data-off], [data-off] *, [data-off] *::before, [data-off] *::after { animation-play-state: paused !important; }
.animate-glow { will-change: opacity; }
`;
  document.head.appendChild(css);

  if (!("IntersectionObserver" in window)) return;

  const SEL = "section, footer, .marquee-pause";
  const seen = new WeakSet();
  // Section jab tak ek baar screen par aa kar entrance animation na chala le, use pause nahi karte
  // (warna "both" fill wali entrance animations shuru hone se pehle chhupi reh sakti hain).
  const visited = new WeakSet();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          visited.add(e.target);
          e.target.removeAttribute("data-off");
        } else if (visited.has(e.target)) {
          e.target.setAttribute("data-off", "");
        }
      }
    },
    { rootMargin: "150px 0px 150px 0px" },
  );

  const scan = () => {
    document.querySelectorAll(SEL).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      io.observe(el);
    });
  };

  scan();
  // Naya page / lazy section aaye to use bhi observe karo (debounced, sasta)
  let t = 0;
  const root = document.getElementById("root");
  if (root && "MutationObserver" in window) {
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(scan, 250);
    }).observe(root, { childList: true, subtree: true });
  }
}
