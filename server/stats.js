// Admin dashboard ke hisaab-kitaab (pure function, DB se alag taake test ho sake)
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const normStatus = (s) =>
  s === "confirmed" ? "processing" : STATUSES.includes(s) ? s : "pending";
const round2 = (n) => Math.round(n * 100) / 100;

function buildStats(orders, products, views) {
  const byStatus = {};
  STATUSES.forEach((s) => (byStatus[s] = { count: 0, PKR: 0, USD: 0 }));

  const per = new Map(
    products.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.name,
        category: p.category,
        featured: !!p.featured,
        in_stock: p.in_stock !== false,
        views: 0,
        visitors: 0,
        orders: 0,
        units: 0,
        boxMap: new Map(), // option / box (Signature Box, Special Box ...) -> units
      },
    ]),
  );
  let totalViews = 0;
  for (const v of views || []) {
    const r = per.get(v.product_id);
    if (!r) continue;
    r.views = Number(v.views) || 0;
    r.visitors = Number(v.visitors) || 0;
    totalViews += r.views;
  }

  let totalOrders = 0;
  for (const o of orders || []) {
    const s = normStatus(o.status);
    const cur = o.currency === "PKR" ? "PKR" : "USD";
    const b = byStatus[s];
    b.count += 1;
    b[cur] = round2(b[cur] + Number(o.total || 0));
    totalOrders += 1;
    if (s !== "cancelled") {
      const seen = new Set();
      for (const it of Array.isArray(o.items) ? o.items : []) {
        const r = per.get(it.id);
        if (!r) continue;
        // ek order me ek product (Signature + Special dono) ek hi order ginta hai
        if (!seen.has(it.id)) {
          seen.add(it.id);
          r.orders += 1;
        }
        const q = Number(it.qty) || 0;
        r.units += q;
        if (it.variant_label) {
          const b = r.boxMap.get(it.variant_label) || 0;
          r.boxMap.set(it.variant_label, b + q);
        }
      }
    }
  }

  const upcoming = { PKR: 0, USD: 0 };
  for (const s of ["pending", "processing", "shipped"]) {
    upcoming.PKR = round2(upcoming.PKR + byStatus[s].PKR);
    upcoming.USD = round2(upcoming.USD + byStatus[s].USD);
  }

  return {
    totalOrders,
    byStatus,
    earnings: { PKR: byStatus.delivered.PKR, USD: byStatus.delivered.USD },
    upcoming,
    totalViews,
    products: [...per.values()]
      .map(({ boxMap, ...r }) => ({
        ...r,
        boxes: [...boxMap].map(([label, units]) => ({ label, units })),
      }))
      .sort(
        (a, b) =>
          b.visitors - a.visitors ||
          b.views - a.views ||
          a.name.localeCompare(b.name),
      ),
  };
}

module.exports = { STATUSES, normStatus, buildStats };
