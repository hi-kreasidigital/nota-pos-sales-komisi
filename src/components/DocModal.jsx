import React from "react";
import logo from "../assets/logo.png";
import { PKG_LABEL, rp, fullDate } from "../lib/helpers.js";

export default function DocModal({ doc, onClose }) {
  if (!doc) return null;
  const { type, t, sales } = doc;
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="doc-card">
        <button className="doc-close no-print" onClick={onClose}>×</button>
        <img className="doc-logo" src={logo} alt="Nota POS" />
        {type === "certificate" ? (
          <>
            <div className="doc-title">SERTIFIKAT PELATIHAN</div>
            <div className="doc-sub">Nota POS — Sistem Kasir Digital UMKM</div>
            <div className="doc-border">
              <div className="doc-body">
                Dengan ini menyatakan bahwa <b>{t.businessName}</b> (a.n. {t.clientName}) telah menyelesaikan
                pelatihan penggunaan aplikasi <b>Nota POS</b> Paket {PKG_LABEL[t.pkg]}, dibimbing oleh sales
                representative <b>{t.salesName}</b> pada tanggal {fullDate(t.trainingSentAt || t.date)}.
              </div>
              <div className="doc-code">{t.code}</div>
              <div className="doc-foot">Kode ini digunakan sales sebagai bukti konfirmasi pelatihan selesai.</div>
            </div>
            <div className="doc-foot">No. Sertifikat: SERT-{t.id.slice(-6).toUpperCase()}</div>
          </>
        ) : (
          <>
            <div className="doc-title">INVOICE KLAIM KOMISI</div>
            <div className="doc-sub">No. INV-{t.id.slice(-6).toUpperCase()} · {fullDate(t.claimedAt || t.date)}</div>
            <div className="doc-border">
              <div className="doc-line"><span>Sales</span><span>{t.salesName}</span></div>
              <div className="doc-line"><span>No. WA Sales</span><span>{sales?.wa || "-"}</span></div>
              <div className="doc-line"><span>Rekening / E-wallet</span><span>{sales?.bank || "-"}</span></div>
              <div className="doc-line"><span>Klien</span><span>{t.clientName}</span></div>
              <div className="doc-line"><span>Usaha</span><span>{t.businessName}</span></div>
              <div className="doc-line"><span>Paket</span><span>{PKG_LABEL[t.pkg]}</span></div>
              <div className="doc-line" style={{ fontWeight: 800, border: "none" }}>
                <span>Komisi</span><span>{rp(t.commission)}</span>
              </div>
            </div>
            <div className="doc-foot">Mohon diproses pembayaran komisi ke rekening di atas.</div>
          </>
        )}
        <div className="doc-actions no-print">
          <button className="btn ghost" onClick={onClose}>Tutup</button>
          <button className="btn green" onClick={() => window.print()}>Cetak / Simpan PDF</button>
        </div>
      </div>
    </div>
  );
}
