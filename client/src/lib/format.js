export const fmtMoney = (n, cur) =>
  new Intl.NumberFormat(cur === "PKR" ? "en-PK" : "en-US", {
    style: "currency",
    currency: cur === "PKR" ? "PKR" : "USD",
    maximumFractionDigits: cur === "PKR" ? 0 : 2,
  }).format(Number(n) || 0);

export const shortId = (id) =>
  String(id || "")
    .slice(0, 8)
    .toUpperCase();

export const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Order status "confirmed" purana naam hai, ab "processing"
export const normStatus = (s) =>
  s === "confirmed" ? "processing" : s || "pending";
