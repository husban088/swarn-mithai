// Production (Vercel): backend alag host par hota hai (VITE_API_URL). Local dev me khali rehta hai,
// aur Vite proxy /api ko localhost:5000 par bhej deta hai.
export const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(
  /\/+$/,
  "",
);
const KEY = "swarn_session";
export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
};
export const setSession = (s) => localStorage.setItem(KEY, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(KEY);
export const json = (method, body) => ({ method, body: JSON.stringify(body) });

async function raw(path, opts = {}, token) {
  const isForm =
    typeof FormData !== "undefined" && opts.body instanceof FormData;
  const headers = {
    ...(opts.body && !isForm ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(API_BASE + "/api" + path, { ...opts, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok) {
    const e = new Error(
      data?.error ||
        (res.status >= 500
          ? "Server is not reachable. Is the backend running?"
          : "Something went wrong"),
    );
    e.status = res.status;
    throw e;
  }
  return data;
}

export async function api(path, opts = {}) {
  let s = getSession();
  try {
    return await raw(path, opts, s?.token);
  } catch (e) {
    if (e.status === 401 && s?.refresh && !path.startsWith("/auth/")) {
      try {
        const r = await raw(
          "/auth/refresh",
          json("POST", { refresh_token: s.refresh }),
        );
        s = { ...s, token: r.token, refresh: r.refresh };
        setSession(s);
        return await raw(path, opts, s.token);
      } catch {
        clearSession();
        window.dispatchEvent(new Event("session-expired"));
      }
    }
    throw e;
  }
}

export const getVisitorId = () => {
  try {
    let v = localStorage.getItem("swarn_vid");
    if (!v) {
      v = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("swarn_vid", v);
    }
    return v;
  } catch {
    return "anon";
  }
};

// Product visit record: jab bhi koi product kholta hai (page, modal, ya cart me add) ek view jata hai.
// Har dafa count hota hai (admin ka bhi). Sirf 4 sec ka guard hai taake ek hi click do dafa na ginay.
const lastSent = {};
export function trackProductView(id) {
  if (!id) return;
  const now = Date.now();
  if (now - (lastSent[id] || 0) < 4000) return;
  lastSent[id] = now;
  api(
    `/products/${id}/view`,
    json("POST", { visitor_id: getVisitorId() }),
  ).catch(() => {});
}
