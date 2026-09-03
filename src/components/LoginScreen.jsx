import React, { useState } from "react";
export default function LoginScreen({ onLogin, error }) {
  const [pin, setPin] = useState("");
  const press = (d) => { if (pin.length < 6) setPin(pin + d); };
  return (
    <>
      <div className="tagline" style={{ marginTop: 4 }}>Masukkan PIN untuk masuk</div>
      <div className="pin-pad">
        <div className="pin-display">{"•".repeat(pin.length) || " "}</div>
        <div className="pin-grid">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <button key={d} className="pin-key" onClick={() => press(d)}>{d}</button>
          ))}
          <button className="pin-key wide" onClick={() => setPin("")}>HAPUS</button>
          <button className="pin-key" onClick={() => press("0")}>0</button>
          <button className="pin-key wide" onClick={() => setPin(pin.slice(0, -1))}>⌫</button>
        </div>
        {error && <div className="msg-err">{error}</div>}
        <button className="btn green block" style={{ marginTop: 12 }} onClick={() => onLogin(pin)}>MASUK</button>
      </div>
      <footer style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#888' }}><a href="https://kreasi-digital-landing.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>Powered by Kreasi Digital</a></footer>
    </>
  );
}
