import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient.js";
import logo from "./assets/logo.png";
import LoginScreen from "./components/LoginScreen.jsx";
import SalesScreen from "./components/SalesScreen.jsx";
import AdminRingkasan from "./components/AdminRingkasan.jsx";
import AdminKlaim from "./components/AdminKlaim.jsx";
import AdminSales from "./components/AdminSales.jsx";
import AdminSettings from "./components/AdminSettings.jsx";
import DocModal from "./components/DocModal.jsx";
import {
  ADMIN_WA, genCode, openWa,
  txFromRow, txToRow, salesFromRow, salesToRow, settingsFromRow, settingsToRow,
} from "./lib/helpers.js";

const ENV_OK = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function App() {
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [loginErr, setLoginErr] = useState("");
  const [adminTab, setAdminTab] = useState("ringkasan");
  const [salesList, setSalesList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [doc, setDoc] = useState(null);

  const fetchAll = useCallback(async () => {
    const [salesRes, txRes, settingsRes] = await Promise.all([
      supabase.from("sales").select("*").order("created_at", { ascending: true }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").eq("id", 1).single(),
    ]);
    if (salesRes.data) setSalesList(salesRes.data.map(salesFromRow));
    if (txRes.data) setTransactions(txRes.data.map(txFromRow));
    if (settingsRes.data) setSettings(settingsFromRow(settingsRes.data));
  }, []);

  useEffect(() => {
    if (!ENV_OK) { setReady(true); return; }
    fetchAll().finally(() => setReady(true));

    // Realtime sync — aktifkan Realtime replication di Supabase dashboard
    // (Database > Replication) untuk tabel sales, transactions, settings
    // supaya perubahan dari user lain langsung muncul tanpa refresh.
    const channel = supabase
      .channel("nota-pos-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, fetchAll)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const handleLogin = (pin) => {
    if (!pin || !settings) return;
    if (pin === settings.adminPin) { setSession({ role: "admin" }); setLoginErr(""); return; }
    const s = salesList.find((x) => x.pin === pin);
    if (s) { setSession({ role: "sales", salesId: s.id }); setLoginErr(""); return; }
    setLoginErr("PIN salah. Coba lagi.");
  };

  const addTransaction = async (data) => {
    const me = salesList.find((s) => s.id === session.salesId);
    const entry = {
      date: data.date, pkg: data.pkg, clientName: data.clientName.trim(),
      businessName: data.businessName.trim(), clientWa: data.clientWa.trim(),
      salesId: me.id, salesName: me.name, price: data.price, commission: data.commission,
      code: null, status: "baru",
    };
    setSaving(true);
    try {
      const { data: inserted, error } = await supabase.from("transactions").insert(txToRow(entry)).select().single();
      if (error) throw error;
      openWa(ADMIN_WA,
        `Klien baru terdaftar 🆕\nUsaha: ${entry.businessName}\nKlien: ${entry.clientName}\nPaket: ${entry.pkg}\nSales: ${me.name}\nTanggal: ${entry.date}`
      );
      setTransactions((prev) => [txFromRow(inserted), ...prev]);
    } finally {
      setSaving(false);
    }
  };

  const requestTraining = async (id) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.from("transactions")
        .update({ status: "training_requested", training_requested_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      setTransactions((prev) => prev.map((t) => (t.id === id ? txFromRow(data) : t)));
    } finally {
      setSaving(false);
    }
  };

  const processTraining = async (id) => {
    const code = genCode();
    setSaving(true);
    try {
      const { data, error } = await supabase.from("transactions")
        .update({ status: "training_sent", code, training_sent_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      const t = txFromRow(data);
      setTransactions((prev) => prev.map((x) => (x.id === id ? t : x)));
      openWa(t.clientWa,
        `Selamat! 🎉\nTraining aplikasi Nota POS untuk *${t.businessName}* telah selesai dilaksanakan oleh sales kami, ${t.salesName}.\n\nIni adalah sertifikasi bahwa Anda (${t.clientName}) telah menyelesaikan sesi training Nota POS.\n\nKode konfirmasi Anda: *${code}*\n\nMohon berikan kode ini kepada sales (${t.salesName}) sebagai bukti training telah selesai. Terima kasih telah mempercayai Nota POS!`
      );
      setDoc({ type: "certificate", t });
    } finally {
      setSaving(false);
    }
  };

  const claimCommission = async (id) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.from("transactions")
        .update({ status: "claimed", claimed_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      setTransactions((prev) => prev.map((t) => (t.id === id ? txFromRow(data) : t)));
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (id) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.from("transactions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      setTransactions((prev) => prev.map((t) => (t.id === id ? txFromRow(data) : t)));
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async (id) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setSaving(false);
    }
  };

  const addSales = async (data) => {
    setSaving(true);
    try {
      const { data: inserted, error } = await supabase.from("sales").insert(salesToRow(data)).select().single();
      if (error) throw error;
      setSalesList((prev) => [...prev, salesFromRow(inserted)]);
    } finally {
      setSaving(false);
    }
  };

  const deleteSales = async (id) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
      setSalesList((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    try {
      const { error } = await supabase.from("settings").update(settingsToRow(next)).eq("id", 1);
      if (error) throw error;
    } finally {
      setSaving(false);
    }
  };

  const openDoc = (type, t, sales) => setDoc({ type, t, sales });

  if (!ENV_OK) {
    return (
      <div className="wrap">
        <div className="env-warning">
          <b>Supabase belum dikonfigurasi.</b><br /><br />
          Salin file <code>.env.example</code> menjadi <code>.env</code>, lalu isi
          <code> VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> dari
          dashboard Supabase project kamu (Settings → API). Jalankan juga
          <code> supabase/schema.sql</code> di SQL Editor Supabase sebelum memakai aplikasi ini.
          Lihat README.md untuk panduan lengkap.
        </div>
      </div>
    );
  }

  if (!ready || !settings) return <div className="load-screen">Memuat sistem…</div>;

  const me = session?.role === "sales" ? salesList.find((s) => s.id === session.salesId) : null;
  const requestedCount = transactions.filter((t) => t.status === "training_requested").length;
  const claimedCount = transactions.filter((t) => t.status === "claimed").length;

  return (
    <div className="wrap">
      <div className="app-shell">
        <div className="card">
          <div className="logo-row">
            <img src={logo} alt="Nota POS" />
            <div className="tagline">Sistem Sales &amp; Komisi</div>
          </div>

          {!session && <LoginScreen onLogin={handleLogin} error={loginErr} />}

          {session && (
            <>
              <div className="who-row">
                <span className="who-role">{session.role === "admin" ? "ADMIN" : me ? me.name : "SALES"}</span>
                <button className="logout-pill" onClick={() => setSession(null)}>KELUAR</button>
              </div>
              <hr className="divider" />

              {session.role === "sales" && me && (
                <SalesScreen me={me} transactions={transactions} settings={settings}
                  addTransaction={addTransaction} requestTraining={requestTraining}
                  claimCommission={claimCommission} openDoc={openDoc} />
              )}

              {session.role === "admin" && (
                <>
                  <div className="tabs">
                    <button className={"tab-pill" + (adminTab === "ringkasan" ? " active" : "")} onClick={() => setAdminTab("ringkasan")}>RINGKASAN</button>
                    <button className={"tab-pill" + (adminTab === "klaim" ? " active" : "")} onClick={() => setAdminTab("klaim")}>
                      KLAIM
                      {(requestedCount + claimedCount) > 0 && <span className="tab-dot">{requestedCount + claimedCount}</span>}
                    </button>
                    <button className={"tab-pill" + (adminTab === "sales" ? " active" : "")} onClick={() => setAdminTab("sales")}>SALES</button>
                    <button className={"tab-pill" + (adminTab === "settings" ? " active" : "")} onClick={() => setAdminTab("settings")}>ATUR</button>
                  </div>
                  {adminTab === "ringkasan" && <AdminRingkasan transactions={transactions} settings={settings} />}
                  {adminTab === "klaim" && (
                    <AdminKlaim transactions={transactions} salesList={salesList} processTraining={processTraining}
                      markPaid={markPaid} deleteTransaction={deleteTransaction} openDoc={openDoc} />
                  )}
                  {adminTab === "sales" && <AdminSales salesList={salesList} addSales={addSales} deleteSales={deleteSales} settings={settings} />}
                  {adminTab === "settings" && <AdminSettings settings={settings} updateSettings={updateSettings} />}
                </>
              )}
            </>
          )}
          <div className="saving-note">{saving ? "menyimpan…" : ""}</div>
        </div>
      </div>
      <DocModal doc={doc} onClose={() => setDoc(null)} />
    </div>
  );
}
