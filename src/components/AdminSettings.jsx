import React from "react";

export default function AdminSettings({ settings, updateSettings }) {
  return (
    <div className="settings-grid">
      <label>PIN Admin
        <input type="text" value={settings.adminPin} maxLength={6} onChange={(e) => updateSettings({ adminPin: e.target.value.replace(/\D/g, "") })} />
      </label>
      <label>Target klien/bln
        <input type="number" value={settings.targetClients} onChange={(e) => updateSettings({ targetClients: Number(e.target.value) || 0 })} />
      </label>
      <label>Hosting+domain/bln
        <input type="number" value={settings.hostingCost} onChange={(e) => updateSettings({ hostingCost: Number(e.target.value) || 0 })} />
      </label>
      <label>Marketing/bln
        <input type="number" value={settings.marketingCost} onChange={(e) => updateSettings({ marketingCost: Number(e.target.value) || 0 })} />
      </label>
      <label>Harga Starter
        <input type="number" value={settings.priceStarter} onChange={(e) => updateSettings({ priceStarter: Number(e.target.value) || 0 })} />
      </label>
      <label>Harga Growth
        <input type="number" value={settings.priceGrowth} onChange={(e) => updateSettings({ priceGrowth: Number(e.target.value) || 0 })} />
      </label>
      <label>Komisi Starter
        <input type="number" value={settings.commissionStarter} onChange={(e) => updateSettings({ commissionStarter: Number(e.target.value) || 0 })} />
      </label>
      <label>Komisi Growth
        <input type="number" value={settings.commissionGrowth} onChange={(e) => updateSettings({ commissionGrowth: Number(e.target.value) || 0 })} />
      </label>
    </div>
  );
}
