import React from "react";
import { PKG_LABEL, STATUS_LABEL, STATUS_CLASS, rp } from "../lib/helpers.js";

export default function AdminKlaim({ transactions, salesList, processTraining, markPaid, deleteTransaction, openDoc }) {
  const requested = transactions.filter((t) => t.status === "training_requested").sort((a, b) => (a.date < b.date ? 1 : -1));
  const claimed = transactions.filter((t) => t.status === "claimed").sort((a, b) => (a.date < b.date ? 1 : -1));
  const findSales = (id) => salesList.find((s) => s.id === id);

  return (
    <>
      <div className="section-title">🎓 Menunggu Sertifikat ({requested.length})</div>
      {requested.length === 0 && <div className="empty">tidak ada pengajuan training</div>}
      {requested.map((t) => (
        <div className="item" key={t.id}>
          <div className="item-top">
            <div>
              <div className="item-name">{t.businessName}<span className={"chip " + (t.pkg === "growth" ? "blue" : "green") + " badge-pkg"}>{t.pkg}</span></div>
              <div className="item-meta">{t.clientName} · sales: {t.salesName}</div>
            </div>
          </div>
          <div className="item-actions">
            <button className="btn amber sm" onClick={() => processTraining(t.id)}>GENERATE SERTIFIKAT & KIRIM WA</button>
          </div>
        </div>
      ))}

      <div className="section-title">💳 Menunggu Pembayaran ({claimed.length})</div>
      {claimed.length === 0 && <div className="empty">tidak ada klaim komisi tertunda</div>}
      {claimed.map((t) => {
        const s = findSales(t.salesId);
        return (
          <div className="item" key={t.id}>
            <div className="item-top">
              <div>
                <div className="item-name">{t.salesName}<span className={"chip " + (t.pkg === "growth" ? "blue" : "green") + " badge-pkg"}>{t.pkg}</span></div>
                <div className="item-meta">{t.businessName} · {t.clientName}</div>
                {s && <div className="item-meta">Bayar ke: {s.bank || "-"}</div>}
              </div>
              <div className="item-price">{rp(t.commission)}</div>
            </div>
            <div className="item-actions">
              <button className="btn green sm" onClick={() => markPaid(t.id)}>TANDAI SUDAH DIBAYAR</button>
              <button className="btn ghost sm" onClick={() => openDoc("invoice", t, s)}>Lihat Invoice</button>
            </div>
          </div>
        );
      })}

      <div className="section-title">📋 Semua Transaksi</div>
      {transactions.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).map((t) => (
        <div className="item" key={t.id}>
          <div className="item-top">
            <div>
              <div className="item-name">{t.businessName}<span className={"chip " + (t.pkg === "growth" ? "blue" : "green") + " badge-pkg"}>{t.pkg}</span></div>
              <div className="item-meta">{t.clientName} · sales: {t.salesName} · {t.date}</div>
              <span className={"chip " + STATUS_CLASS[t.status]} style={{ marginTop: 6, display: "inline-block" }}>{STATUS_LABEL[t.status]}</span>
            </div>
            <div className="item-price">{rp(t.price)}<div className="item-meta">komisi {rp(t.commission)}</div>
              <button className="del-x" onClick={() => deleteTransaction(t.id)}>×</button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
