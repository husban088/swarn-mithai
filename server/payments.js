// Orders + payments (Cash on Delivery, Stripe Checkout, PayPal).
const orderMail = require("./orderEmail");
const bg = require("./bg");
const { stripPieces } = require("./pieces");
// Koi extra npm package nahi chahiye: Stripe aur PayPal ko seedha REST API se call kiya gaya hai (Node 18+).
const PAY_METHODS = ["cod", "stripe", "paypal", "bank"];
const PAY_NAME = {
  cod: "Cash on delivery",
  stripe: "Card (Stripe)",
  paypal: "PayPal",
  bank: "Bank transfer (Citibank)",
};

module.exports = function mountOrders(ctx) {
  const {
    app,
    db,
    optionalAuth,
    ah,
    normCountry,
    CATS,
    catsFor,
    getRate,
    priceFor,
    CUR,
    esc,
    sendMail,
    wrapMail,
    emailRe,
    ADMINS,
    adminsOf,
    variantPick,
    isReceiptUrl,
    refillUnlocked,
    GATED_VARIANT,
  } = ctx;

  // Server start par Gmail (Pakistan) + Hotmail (USA) login check (console me result dikhta hai)
  if (!process.env.VERCEL) orderMail.verify();

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
  const PP_ID = process.env.PAYPAL_CLIENT_ID || "";
  const PP_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
  // Online payments abhi band hain. Baad me .env me ONLINE_PAYMENTS=true karein.
  const ONLINE =
    String(process.env.ONLINE_PAYMENTS || "").toLowerCase() === "true";
  const stripeReady = ONLINE && !!STRIPE_KEY;
  const paypalReady = ONLINE && !!(PP_ID && PP_SECRET);
  const ppBase = () =>
    String(process.env.PAYPAL_MODE || "sandbox").toLowerCase() === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const short = (id) => String(id).slice(0, 8).toUpperCase();
  const isUuid = (s) => /^[0-9a-f-]{36}$/i.test(String(s || ""));
  const money = (n, cur) =>
    `${cur} ${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  // Return URLs ke liye site ka address (browser ka origin ya CLIENT_URL)
  function baseUrl(req) {
    const o = String(req.body?.origin || "");
    try {
      const u = new URL(o);
      if (u.protocol === "http:" || u.protocol === "https:") return u.origin;
    } catch {
      /* ignore */
    }
    return (
      process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`
    ).replace(/\/$/, "");
  }

  const publicOrder = (o) => ({
    id: o.id,
    status: o.status,
    payment_method: o.payment_method || "cod",
    payment_status: o.payment_status || "unpaid",
    receipt_url: o.receipt_url || null,
    country: o.country,
    currency: o.currency,
    total: Number(o.total),
    items: o.items,
    customer: o.customer,
    created_at: o.created_at,
  });

  /* ------------------------- Stripe ------------------------- */
  async function stripeCreate(order, base, email) {
    const p = new URLSearchParams();
    p.set("mode", "payment");
    p.set("success_url", `${base}/order-placed/${order.id}?paid=1`);
    p.set("cancel_url", `${base}/checkout?payment=cancelled`);
    p.set("client_reference_id", order.id);
    p.set("metadata[order_id]", order.id);
    if (email) p.set("customer_email", email);
    order.items.forEach((l, i) => {
      p.set(`line_items[${i}][quantity]`, String(l.qty));
      p.set(
        `line_items[${i}][price_data][currency]`,
        String(order.currency).toLowerCase(),
      );
      p.set(
        `line_items[${i}][price_data][unit_amount]`,
        String(Math.round(Number(l.price) * 100)),
      );
      p.set(
        `line_items[${i}][price_data][product_data][name]`,
        l.unit ? `${l.name} (${l.unit})` : l.name,
      );
    });
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: p,
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.url)
      throw new Error(
        d?.error?.message || "Stripe session could not be created.",
      );
    return { id: d.id, url: d.url };
  }

  async function stripeIsPaid(order) {
    const r = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(order.payment_ref)}`,
      { headers: { Authorization: `Bearer ${STRIPE_KEY}` } },
    );
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.error?.message || "Stripe check failed.");
    return d.payment_status === "paid" && d.metadata?.order_id === order.id;
  }

  /* ------------------------- PayPal ------------------------- */
  async function ppToken() {
    const r = await fetch(`${ppBase()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${PP_ID}:${PP_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token)
      throw new Error(
        d.error_description ||
          "PayPal login failed. PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET check karein.",
      );
    return d.access_token;
  }

  // PayPal PKR support nahi karta, isliye PKR orders USD me convert hote hain
  const ppAmount = (order, rate) => {
    const usd =
      order.currency === "USD"
        ? Number(order.total)
        : Number(order.total) / rate;
    return Math.max(0.01, Math.round(usd * 100) / 100).toFixed(2);
  };

  async function ppCreate(order, base) {
    const token = await ppToken();
    const r = await fetch(`${ppBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": order.id,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.id,
            custom_id: order.id,
            description: `${order.country === "PK" ? "Evelyn One" : "Mithai House"} order #${short(order.id)}`,
            amount: {
              currency_code: "USD",
              value: ppAmount(order, (await getRate()).rate),
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name:
                order.country === "PK" ? "Evelyn One" : "Mithai House",
              user_action: "PAY_NOW",
              shipping_preference: "NO_SHIPPING",
              return_url: `${base}/order-placed/${order.id}`,
              cancel_url: `${base}/checkout?payment=cancelled`,
            },
          },
        },
      }),
    });
    const d = await r.json().catch(() => ({}));
    const link = (d.links || []).find(
      (l) => l.rel === "payer-action" || l.rel === "approve",
    );
    if (!r.ok || !link)
      throw new Error(d?.message || "PayPal order could not be created.");
    return { id: d.id, url: link.href };
  }

  async function ppIsPaid(order) {
    const token = await ppToken();
    const h = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const ref = encodeURIComponent(order.payment_ref);
    let r = await fetch(`${ppBase()}/v2/checkout/orders/${ref}/capture`, {
      method: "POST",
      headers: h,
      body: "{}",
    });
    let d = await r.json().catch(() => ({}));
    if (!r.ok) {
      // Shayad pehle hi capture ho chuka hai, ya payer ne abhi approve nahi kiya
      r = await fetch(`${ppBase()}/v2/checkout/orders/${ref}`, { headers: h });
      d = await r.json().catch(() => ({}));
    }
    return (
      d.status === "COMPLETED" &&
      d.purchase_units?.[0]?.reference_id === order.id
    );
  }

  /* ------------------------- Email ------------------------- */
  // Order ki poori detail (cart + checkout + payment) customer ki Gmail par, aur admin ko copy.
  function notify(order) {
    bg(
      orderMail.sendOrderMails(order, {
        admins: adminsOf ? adminsOf(order.country) : ADMINS,
      }),
    );
  }

  /* ------------------------- Routes ------------------------- */
  app.get("/api/payments/config", async (req, res) =>
    res.json({
      cod: true,
      bank: true,
      stripe: stripeReady,
      paypal: paypalReady,
      pkrPerUsd: (await getRate()).rate,
    }),
  );

  // Checkout form ki validation (client jaisi hi rules)
  const CK_EMAIL =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  const CK_NAME = /^\p{L}[\p{L}\s.'’-]*$/u;
  const CK_CITY = /^\p{L}[\p{L}\s.,'’-]*$/u;
  function checkCustomer(c, country) {
    const name = String(c.name || "").trim();
    const phone = String(c.phone || "").trim();
    const email = String(c.email || "").trim();
    const address = String(c.address || "").trim();
    const city = String(c.city || "").trim();
    const postal = String(c.postal || "").trim();
    if (!name) return "Please enter your full name.";
    if (name.length < 2 || !CK_NAME.test(name))
      return "Name can only contain letters and spaces.";
    if (!phone) return "Please enter your phone number.";
    const digits = phone.replace(/\D/g, "").length;
    if (!/^\+?[0-9\s\-()]+$/.test(phone) || digits < 7 || digits > 15)
      return "Enter a valid phone number (7 to 15 digits).";
    if (!email) return "Please enter your email address.";
    if (!CK_EMAIL.test(email)) return "Enter a valid email address.";
    // Pakistan (Evelyn One): sirf Gmail address, order ki details usi Gmail par jati hain
    if (country === "PK" && !/@gmail\.com$/i.test(email))
      return "Please enter your Gmail address (name@gmail.com). Order details are sent to your Gmail.";
    if (address.length < 5) return "Please enter your delivery address.";
    if (city.length < 2 || !CK_CITY.test(city))
      return "Enter a valid city name.";
    if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{1,8}[A-Za-z0-9]$/.test(postal))
      return "Enter a valid postal code.";
    return "";
  }

  app.post(
    "/api/orders",
    optionalAuth,
    ah(async (req, res) => {
      const country = normCountry(req.body?.country);
      const { items, customer } = req.body || {};
      const method = PAY_METHODS.includes(req.body?.payment_method)
        ? req.body.payment_method
        : "cod";
      if (method === "stripe" && !stripeReady)
        return res.status(400).json({
          error: "Card payment is not set up yet (Stripe key missing).",
        });
      if (method === "paypal" && !paypalReady)
        return res
          .status(400)
          .json({ error: "PayPal is not set up yet (PayPal keys missing)." });
      // Bank transfer (Citibank): sirf Mithai House (USA). Receipt image lazmi hai, uske baghair order place nahi hota.
      const receiptUrl = String(req.body?.receipt_url || "").trim();
      if (method === "bank") {
        if (country !== "US")
          return res.status(400).json({
            error: "Bank transfer is only available for Mithai House (USA).",
          });
        if (!receiptUrl)
          return res.status(400).json({
            error:
              "Please upload your payment receipt first. Your order cannot be placed without it.",
          });
        if (!isReceiptUrl(receiptUrl))
          return res.status(400).json({
            error:
              "Receipt upload is invalid. Please upload your Citibank payment receipt again.",
          });
      }
      if (!Array.isArray(items) || !items.length)
        return res.status(400).json({ error: "Your cart is empty." });
      const c = customer || {};
      const bad = checkCustomer(c, country);
      if (bad) return res.status(400).json({ error: bad });

      const rate = (await getRate()).rate;
      const ids = items.map((i) => i.id);
      const { data: prods, error } = await db
        .from("products")
        .select("*")
        .in("id", ids)
        .in("category", catsFor(country, req.user));
      if (error) throw error;

      // 19 L "Refill": sirf us customer ko jis ka pehla 19 L order delivered ho chuka ho
      const wantsGated = items.some(
        (it) =>
          it.v === GATED_VARIANT &&
          prods.find((x) => x.id === it.id)?.category === "aqua",
      );
      if (wantsGated && !(await refillUnlocked(req.user)))
        return res.status(403).json({
          error:
            "Refill is only available after your first 19 L bottle has been delivered to you. Please sign in with the account you ordered with, or order the first-time bottle.",
        });

      let total = 0;
      const lines = [];
      for (const it of items) {
        const p = prods.find((x) => x.id === it.id);
        const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
        // Variant (Pure / Mix / Refill ...): price server khud nikalta hai, client ki price par bharosa nahi
        const vp =
          p && variantPick ? variantPick(p, it.v, country, rate) : null;
        const price = vp
          ? Number(vp.price)
          : Number(priceFor(p, country, rate));
        if (!p || !p.in_stock || !price)
          return res.status(400).json({
            error: `"${p?.name || "An item"}" is not available in your country.`,
          });
        total += price * qty;
        lines.push({
          id: p.id,
          category: p.category,
          ...(vp ? { variant: vp.v.key, variant_label: vp.v.label } : {}),
          name: vp ? `${p.name} - ${vp.v.label}` : p.name,
          unit: stripPieces(p.name, vp ? vp.v.note || p.unit : p.unit),
          qty,
          price,
          image: (vp && vp.v.image) || p.image_url || "",
        });
      }
      total = Math.round(total * 100) / 100;

      // Checkout par jo email likhi gayi wohi use hogi (login wali email se alag bhi ho sakti hai)
      const orderEmail = String(c.email).trim();
      const row = {
        user_id: req.user?.id || null,
        email: orderEmail,
        country,
        currency: CUR[country],
        total,
        items: lines,
        payment_method: method,
        payment_status:
          method === "cod" ? "unpaid" : method === "bank" ? "paid" : "awaiting",
        ...(method === "bank" ? { receipt_url: receiptUrl } : {}),
        customer: {
          name: c.name.trim().slice(0, 100),
          phone: c.phone.trim().slice(0, 30),
          address: c.address.trim().slice(0, 300),
          city: c.city.trim().slice(0, 80),
          postal: String(c.postal || "")
            .trim()
            .slice(0, 20),
          notes: "",
          email: orderEmail,
          account_email: String(req.user?.email || "")
            .trim()
            .toLowerCase(),
          guest: !req.user,
        },
      };
      const { data: order, error: e2 } = await db
        .from("orders")
        .insert(row)
        .select()
        .single();
      if (e2) {
        if (/payment_(method|status|ref)|receipt_url/.test(e2.message || ""))
          throw new Error(
            "Database update baaki hai: supabase/bank-receipts.sql ko Supabase SQL Editor me Run karein.",
          );
        throw e2;
      }

      if (method === "cod" || method === "bank") {
        notify(order);
        return res.json({ order: publicOrder(order) });
      }

      // Online payment: gateway par bhejo. Cart tab clear hoga jab payment confirm ho jaye.
      try {
        const base = baseUrl(req);
        const s =
          method === "stripe"
            ? await stripeCreate(order, base, row.email)
            : await ppCreate(order, base);
        await db
          .from("orders")
          .update({ payment_ref: s.id })
          .eq("id", order.id);
        return res.json({ order: publicOrder(order), redirect_url: s.url });
      } catch (err) {
        await db.from("orders").delete().eq("id", order.id);
        return res.status(502).json({ error: err.message });
      }
    }),
  );

  app.get(
    "/api/orders/:id",
    ah(async (req, res) => {
      if (!isUuid(req.params.id))
        return res.status(404).json({ error: "Order not found." });
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Order not found." });
      res.set("Cache-Control", "no-store");
      res.json({ order: publicOrder(data) });
    }),
  );

  // Payment wapas aane par: gateway se pooch kar order "paid" mark karta hai (dobara chalane se koi nuqsan nahi)
  app.post(
    "/api/orders/:id/confirm",
    ah(async (req, res) => {
      if (!isUuid(req.params.id))
        return res.status(404).json({ error: "Order not found." });
      const { data: order, error } = await db
        .from("orders")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();
      if (error) throw error;
      if (!order) return res.status(404).json({ error: "Order not found." });
      if (order.payment_status !== "awaiting")
        return res.json({ order: publicOrder(order) });

      let paid = false;
      let message = "";
      try {
        if (order.payment_ref) {
          paid =
            order.payment_method === "stripe"
              ? await stripeIsPaid(order)
              : await ppIsPaid(order);
        }
      } catch (e) {
        message = e.message;
      }
      if (!paid) {
        return res.json({
          order: publicOrder(order),
          message: message || "Payment is not completed yet.",
        });
      }
      const { data: upd } = await db
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", order.id)
        .eq("payment_status", "awaiting")
        .select();
      const fresh = upd?.[0] || { ...order, payment_status: "paid" };
      if (upd?.length) notify(fresh); // email sirf ek dafa
      res.json({ order: publicOrder(fresh) });
    }),
  );
};
