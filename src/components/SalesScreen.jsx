import React, { useState } from "react";
import { PKG_LABEL, STATUS_LABEL, STATUS_CLASS, rp, todayStr, openWa, ADMIN_WA } from "../lib/helpers.js";

export default function SalesScreen({ me, transactions, settings, addTransaction, requestTraining, claimCommission, openDoc }) {
  const [form, setForm] = useState({ date: todayStr(), pkg: "starter", clientName: "", businessName: "", clientWa: "" });
  const [claimCodeInput, setClaimCodeInput] = useState({});
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);

  const mine = transactions.filter((t) => t.salesId === me.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const paid = mine.filter((t) => t.status === "paid").reduce((s, t) => s + t.commission, 0);
  const pending = mine.filter((t) => t.status !== "paid").reduce((s, t) => s + t.commission, 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.clientName.trim() || !form.businessName.trim() || !form.clientWa.trim()) return;
    const price = form.pkg === "starter" ? settings.priceStarter : settings.priceGrowth;
    const commission = form.pkg === "starter" ? settings.commissionStarter : settings.commissionGrowth;
    setBusy(true);
    try {
      await addTransaction({ ...form, price, commission });
      setForm({ date: todayStr(), pkg: "starter", clientName: "", businessName: "", clientWa: "" });
    } finally {
      setBusy(false);
    }
  };

  const doClaim = async (t) => {
    const input = (claimCodeInput[t.id] || "").trim();
    if (input !== t.code) { setErr({ ...err, [t.id]: "Kode tidak sesuai." }); return; }
    setErr({ ...err, [t.id]: "" });
    openWa(ADMIN_WA,
      `Invoice Klaim Komisi 🧾\nSales: ${me.name}\nNo. WA Sales: ${me.wa}\nRekening/E-wallet: ${me.bank}\n\nKlien: ${t.clientName}\nUsaha: ${t.businessName}\nPaket: ${PKG_LABEL[t.pkg]}\nKomisi: ${rp(t.commission)}\n\nMohon diproses pembayaran komisinya. Terima kasih.`
    );
    await claimCommission(t.id);
    openDoc("invoice", t, me);
  };

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card green"><div className="stat-label">Komisi dibayar</div><div className="stat-value">{rp(paid)}</div></div>
        <div className="stat-card amber"><div className="stat-label">Dalam proses</div><div className="stat-value">{rp(pending)}</div></div>
      </div>

      <div className="section-title">✏️ Tambah Klien Baru</div>
      <form className="add-form" onSubmit={submit}>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select value={form.pkg} onChange={(e) => setForm({ ...form, pkg: e.target.value })}>
          <option value="starter">Starter — {rp(settings.priceStarter)}</option>
          <option value="growth">Growth — {rp(settings.priceGrowth)}</option>
        </select>
        <input className="full" type="text" placeholder="Nama klien" value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
        <input className="full" type="text" placeholder="Nama usaha (mis. Toko Sumber Rejeki)" value={form.businessName}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        <input className="full" type="text" placeholder="No. WA klien (mis. 0812xxxxxxx)" value={form.clientWa}
          onChange={(e) => setForm({ ...form, clientWa: e.target.value })} />
        <button className="btn green block" type="submit" disabled={busy}>{busy ? "MENYIMPAN..." : "TAMBAH KLIEN"}</button>
      </form>

      <div className="section-title">👥 Klien Saya ({mine.length})</div>
      {mine.length === 0 && <div className="empty">belum ada klien tercatat</div>}
      {mine.map((t) => (
        <div className="item" key={t.id}>
          <div className="item-top">
            <div>
              <div className="item-name">{t.businessName}<span className={"chip " + (t.pkg === "growth" ? "blue" : "green") + " badge-pkg"}>{t.pkg}</span></div>
              <div className="item-meta">{t.clientName} · {t.date}</div>
            </div>
            <div className="item-price">{rp(t.commission)}</div>
          </div>
          <span className={"chip " + STATUS_CLASS[t.status]} style={{ marginTop: 8, display: "inline-block" }}>{STATUS_LABEL[t.status]}</span>
          <div className="item-actions">
            {t.status === "baru" && (
              <button className="btn amber sm" onClick={() => requestTraining(t.id)}>AJUKAN TRAINING SELESAI</button>
            )}
            {t.status === "training_sent" && (
              <div className="code-input-row">
                <input type="text" placeholder="Kode" maxLength={6}
                  value={claimCodeInput[t.id] || ""}
                  onChange={(e) => setClaimCodeInput({ ...claimCodeInput, [t.id]: e.target.value })} />
                <button className="btn green sm" onClick={() => doClaim(t)}>KLAIM KOMISI</button>
              </div>
            )}
            {["training_sent", "claimed", "paid"].includes(t.status) && (
              <button className="btn ghost sm" onClick={() => openDoc("certificate", t)}>Lihat Sertifikat</button>
            )}
            {["claimed", "paid"].includes(t.status) && (
              <button className="btn ghost sm" onClick={() => openDoc("invoice", t, me)}>Lihat Invoice</button>
            )}
          </div>
          {err[t.id] && <div className="msg-err">{err[t.id]}</div>}
        </div>
      ))}
    </>
  );
}
