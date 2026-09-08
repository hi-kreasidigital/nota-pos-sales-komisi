export const ADMIN_WA = "6285117732474";

export const PKG_LABEL = { starter: "Starter", growth: "Growth" };

export const STATUS_LABEL = {
  baru: "Klien Baru",
  training_requested: "Menunggu Sertifikat Admin",
  training_sent: "Menunggu Klaim Sales",
  claimed: "Menunggu Pembayaran",
  paid: "Komisi Dibayar",
};

export const STATUS_CLASS = {
  baru: "blue",
  training_requested: "amber",
  training_sent: "amber",
  claimed: "amber",
  paid: "green",
};

export const rp = (n) =>
  "Rp" + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const monthKey = (d) => (d || "").slice(0, 7);

export const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

export const fullDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const thisMonthKey = () => todayStr().slice(0, 7);

export const genCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const genPin = (taken) => {
  let p;
  do {
    p = String(Math.floor(1000 + Math.random() * 9000));
  } while (taken.includes(p));
  return p;
};

export function normalizeWa(n) {
  let d = (n || "").replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (!d.startsWith("62")) d = "62" + d;
  return d;
}

export function waLink(number, text) {
  return `https://wa.me/${normalizeWa(number)}?text=${encodeURIComponent(text)}`;
}

export function openWa(number, text) {
  try {
    window.open(waLink(number, text), "_blank");
  } catch (_) {
    // pop-up diblokir browser — abaikan, pesan tetap tersedia lewat waLink()
  }
}

// ---------- Mapping baris Supabase (snake_case) <-> objek JS (camelCase) ----------

export function txFromRow(r) {
  return {
    id: r.id,
    date: r.date,
    pkg: r.pkg,
    clientName: r.client_name,
    businessName: r.business_name,
    clientWa: r.client_wa,
    salesId: r.sales_id,
    salesName: r.sales_name,
    price: Number(r.price),
    commission: Number(r.commission),
    code: r.code,
    status: r.status,
    trainingRequestedAt: r.training_requested_at,
    trainingSentAt: r.training_sent_at,
    claimedAt: r.claimed_at,
    paidAt: r.paid_at,
  };
}

export function txToRow(t) {
  return {
    date: t.date,
    pkg: t.pkg,
    client_name: t.clientName,
    business_name: t.businessName,
    client_wa: t.clientWa,
    sales_id: t.salesId,
    sales_name: t.salesName,
    price: t.price,
    commission: t.commission,
    code: t.code ?? null,
    status: t.status,
  };
}

export function salesFromRow(r) {
  return { id: r.id, name: r.name, wa: r.wa, email: r.email, pin: r.pin, bank: r.bank };
}

export function salesToRow(s) {
  return { name: s.name, wa: s.wa, email: s.email || null, pin: s.pin, bank: s.bank || null };
}

export function settingsFromRow(r) {
  return {
    adminPin: r.admin_pin,
    hostingCost: Number(r.hosting_cost),
    marketingCost: Number(r.marketing_cost),
    commissionStarter: Number(r.commission_starter),
    commissionGrowth: Number(r.commission_growth),
    priceStarter: Number(r.price_starter),
    priceGrowth: Number(r.price_growth),
    targetClients: Number(r.target_clients),
  };
}

export function settingsToRow(s) {
  return {
    admin_pin: s.adminPin,
    hosting_cost: s.hostingCost,
    marketing_cost: s.marketingCost,
    commission_starter: s.commissionStarter,
    commission_growth: s.commissionGrowth,
    price_starter: s.priceStarter,
    price_growth: s.priceGrowth,
    target_clients: s.targetClients,
  };
}
