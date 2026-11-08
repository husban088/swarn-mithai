import { shortId } from "./format";

// Orders page aur Sales page dono ka shared search.
// Order number (#A1B2C3D4 ya full id), customer name, email, phone (USA aur Pakistan dono formats),
// city aur address se order dhoondta hai. Multiple words ho to sab words match hone chahiye.

const digits = (s) => String(s || "").replace(/\D/g, "");

// Phone ko "core" number me badalta hai taake +92 300 1234567, 0300-1234567, 923001234567,
// +1 (555) 123-4567 aur 5551234567 sab ek jaisay match hon.
const core = (d) =>
  d
    .replace(/^00/, "")
    .replace(/^(92|1)(?=\d{10}$)/, "")
    .replace(/^0/, "");

export function orderMatches(o, query) {
  const q = String(query || "")
    .trim()
    .toLowerCase()
    .replace(/^#/, "");
  if (!q) return true;

  const c = o?.customer || {};
  const sid = shortId(o?.id).toLowerCase();
  const fullId = String(o?.id || "").toLowerCase();
  const phone = String(c.phone || "");
  const pd = digits(phone);
  const pcore = core(pd);

  const hay = [sid, fullId, c.name, o?.email, c.email, phone, c.city, c.address]
    .join(" ")
    .toLowerCase();

  // Poora query phone jaisa ho (spaces/+/-/bracket ke saath) to seedha phone se match karo
  if (/^[\d+\-().\s]+$/.test(q)) {
    const qd = digits(q);
    if (qd.length >= 3) {
      if (pd.includes(qd)) return true;
      const qc = core(qd);
      if (qc.length >= 3 && pcore.includes(qc)) return true;
    }
  }

  return q
    .split(/\s+/)
    .map((t) => t.replace(/^#/, ""))
    .filter(Boolean)
    .every((t) => {
      if (hay.includes(t)) return true;
      // Sirf number/phone jaisa text ho to digits se match karo (spaces, dash, +, bracket ignore)
      if (/^[\d+\-().]+$/.test(t)) {
        const td = digits(t);
        if (td.length >= 3) {
          if (pd.includes(td)) return true;
          const tc = core(td);
          if (tc.length >= 3 && pcore.includes(tc)) return true;
        }
      }
      return false;
    });
}
