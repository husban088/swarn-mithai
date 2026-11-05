// Vercel (serverless) par response bhejne ke baad function freeze ho jata hai.
// waitUntil se email jaisay background kaam poore hone tak function zinda rehta hai.
// Local / Render par @vercel/functions na ho to ye bas promise ko chalne deta hai.
module.exports = function bg(p) {
  const pr = Promise.resolve(p).catch((e) =>
    console.error("[bg] background task failed:", e && e.message),
  );
  try {
    require("@vercel/functions").waitUntil(pr);
  } catch {
    /* local: koi baat nahi */
  }
  return pr;
};
