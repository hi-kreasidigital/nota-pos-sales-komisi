import React, { useState } from "react";
import { genPin } from "../lib/helpers.js";

export default function AdminSales({ salesList, addSales, deleteSales, settings }) {
  const [form, setForm] = useState({ name: "", wa: "", email: "", bank: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.wa.trim()) return;
    const takenPins = [settings.adminPin, ...salesList.map((s) => s.pin)];
    setBusy(true);
    try {
      await addSales({ ...form, pin: genPin(takenPins) });
      setForm({ name: "", wa: "", email: "", bank: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="section-title">➕ Daftarkan Sales Baru</div>
      <form className="add-form" onSubmit={submit}>
        <input className="full" type="text" placeholder="Nama sales" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="text" placeholder="No. WA" value={form.wa} onChange={(e) => setForm({ ...form, wa: e.target.value })} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="full" type="text" placeholder="Rekening bank / e-wallet" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} />
        <button className="btn green block" type="submit" disabled={busy}>{busy ? "MENYIMPAN..." : "DAFTARKAN & GENERATE PIN"}</button>
      </form>
      <div className="section-title">👥 Daftar Sales ({salesList.length})</div>
      {salesList.length === 0 && <div className="empty">belum ada sales terdaftar</div>}
      {salesList.map((s) => (
        <div className="sales-card" key={s.id}>
          <div className="sales-card-row"><b style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.name}</b><span className="pin-chip">PIN {s.pin}</span></div>
          <div className="sales-card-row"><span>{s.wa}</span><span>{s.email}</span></div>
          <div className="sales-card-row"><span className="item-meta">{s.bank}</span><button className="del-x" onClick={() => deleteSales(s.id)}>×</button></div>
        </div>
      ))}
    </>
  );
}
