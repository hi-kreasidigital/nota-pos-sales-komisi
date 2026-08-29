import React, { useState } from "react";
import { rp, monthKey, monthLabel, thisMonthKey } from "../lib/helpers.js";

export default function AdminRingkasan({ transactions, settings }) {
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey());
  const months = Array.from(new Set(transactions.map((t) => monthKey(t.date)))).sort();
  if (!months.includes(selectedMonth)) months.push(selectedMonth);
  months.sort();

  const monthTx = transactions.filter((t) => monthKey(t.date) === selectedMonth);
  const totalRevenue = monthTx.reduce((s, t) => s + t.price, 0);
  const totalCommission = monthTx.reduce((s, t) => s + t.commission, 0);
  const commissionPaid = monthTx.filter((t) => t.status === "paid").reduce((s, t) => s + t.commission, 0);
  const commissionPending = totalCommission - commissionPaid;
  const fixedCost = settings.hostingCost + settings.marketingCost;
  const netProfit = totalRevenue - totalCommission - fixedCost;
  const clientCount = monthTx.length;
  const targetHit = clientCount >= settings.targetClients;
  const progressPct = Math.min(100, (clientCount / Math.max(1, settings.targetClients)) * 100);

  const bySales = Object.values(
    monthTx.reduce((acc, t) => {
      acc[t.salesName] = acc[t.salesName] || { name: t.salesName, clients: 0, commission: 0, paid: 0 };
      acc[t.salesName].clients += 1;
      acc[t.salesName].commission += t.commission;
      if (t.status === "paid") acc[t.salesName].paid += t.commission;
      return acc;
    }, {})
  ).sort((a, b) => b.commission - a.commission);

  return (
    <>
      <div className="month-row">
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700 }}>Periode</span>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      <div className="stat-grid">
        <div className="stat-card green"><div className="stat-label">Penjualan</div><div className="stat-value">{rp(totalRevenue)}</div></div>
        <div className="stat-card rust"><div className="stat-label">Komisi Accrued</div><div className="stat-value">{rp(totalCommission)}</div></div>
        <div className="stat-card amber"><div className="stat-label">Belum Dibayar</div><div className="stat-value">{rp(commissionPending)}</div></div>
        <div className="stat-card blue"><div className="stat-label">Biaya Tetap</div><div className="stat-value">{rp(fixedCost)}</div></div>
      </div>

      <div className="section-title">📈 Profit Bersih</div>
      <div className="item" style={{ textAlign: "center" }}>
        <div className="stat-value" style={{ fontSize: 22, color: netProfit < 0 ? "var(--rust)" : "var(--green)" }}>{rp(netProfit)}</div>
        <div className="item-meta">{clientCount}/{settings.targetClients} klien bulan ini</div>
        <div className="progress-track"><div className="progress-fill" style={{ width: progressPct + "%", background: targetHit ? "var(--green)" : "var(--amber)" }} /></div>
      </div>

      {bySales.length > 0 && (
        <>
          <div className="section-title">🏆 Rekap per Sales</div>
          {bySales.map((s) => (
            <div className="item" key={s.name}>
              <div className="item-top">
                <div><div className="item-name">{s.name}</div><div className="item-meta">{s.clients} klien</div></div>
                <div className="item-price">{rp(s.commission)}<div className="item-meta">dibayar {rp(s.paid)}</div></div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
