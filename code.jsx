import { useState, useEffect } from "react";

const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2847.50, change: 34.20, changePct: 1.22, sector: "Energy", exchange: "NSE" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3921.10, change: -28.75, changePct: -0.73, sector: "IT Services", exchange: "NSE" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1678.40, change: 12.85, changePct: 0.77, sector: "Banking", exchange: "NSE" },
  { symbol: "INFY", name: "Infosys Ltd.", price: 1542.60, change: -18.30, changePct: -1.17, sector: "IT Services", exchange: "NSE" },
  { symbol: "WIPRO", name: "Wipro Ltd.", price: 487.25, change: 6.40, changePct: 1.33, sector: "IT Services", exchange: "NSE" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 1243.80, change: 22.10, changePct: 1.81, sector: "Banking", exchange: "NSE" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ", price: 1389.60, change: -41.20, changePct: -2.88, sector: "Infrastructure", exchange: "NSE" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", price: 7124.30, change: 89.50, changePct: 1.27, sector: "NBFC", exchange: "NSE" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd.", price: 164.35, change: -3.20, changePct: -1.91, sector: "Metals", exchange: "NSE" },
  { symbol: "SBIN", name: "State Bank of India", price: 812.70, change: 14.60, changePct: 1.83, sector: "Banking", exchange: "NSE" },
];

const INDICES = [
  { name: "NIFTY 50", value: 22483.65, change: 124.30, changePct: 0.56 },
  { name: "SENSEX", value: 73961.29, change: 398.45, changePct: 0.54 },
  { name: "NIFTY BANK", value: 48312.40, change: -87.20, changePct: -0.18 },
  { name: "NIFTY IT", value: 34218.75, change: -312.60, changePct: -0.91 },
];

function generateCandleData(basePrice, days = 60) {
  const data = [];
  let price = basePrice * 0.85;
  for (let i = 0; i < days; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.025;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * price * 0.008;
    const low = Math.min(open, close) - Math.random() * price * 0.008;
    const volume = Math.floor(Math.random() * 80000000 + 5000000);
    data.push({ day: i, open, close, high, low, volume });
    price = close;
  }
  return data;
}

function generateSignal(data) {
  const last = data[data.length - 1];
  const prev5 = data.slice(-6, -1);
  const avg = prev5.reduce((s, d) => s + d.close, 0) / 5;
  const trend = last.close > avg ? "BULLISH" : "BEARISH";
  const strength = Math.abs(((last.close - avg) / avg) * 100).toFixed(1);
  const rsi = 30 + Math.random() * 40 + (trend === "BULLISH" ? 10 : 0);
  const macd = trend === "BULLISH" ? (Math.random() * 8).toFixed(2) : (-Math.random() * 8).toFixed(2);
  const support = (last.close * (0.94 + Math.random() * 0.03)).toFixed(2);
  const resistance = (last.close * (1.03 + Math.random() * 0.04)).toFixed(2);
  return { trend, strength, rsi: rsi.toFixed(1), macd, support, resistance };
}

function formatINR(val) {
  if (val >= 10000000) return "₹" + (val / 10000000).toFixed(2) + " Cr";
  if (val >= 100000) return "₹" + (val / 100000).toFixed(2) + " L";
  return "₹" + val.toLocaleString("en-IN");
}

function CandleChart({ data }) {
  const width = 680, height = 250;
  const pad = { top: 16, right: 16, bottom: 28, left: 64 };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;
  const visible = data.slice(-44);
  const allP = visible.flatMap(d => [d.high, d.low]);
  const minP = Math.min(...allP);
  const maxP = Math.max(...allP);
  const range = maxP - minP || 1;
  const cw = Math.max(3, (cW / visible.length) - 1.5);
  const sy = (p) => cH - ((p - minP) / range) * cH;
  const sx = (i) => (i / visible.length) * cW + cw / 2;
  const closeLine = visible.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.close)}`).join(" ");
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minP + (range * i) / 4;
    return { val, y: sy(val) };
  });
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="indGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9933" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FF9933" stopOpacity="0" />
        </linearGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {yTicks.map(({ val, y }, i) => (
          <g key={i}>
            <line x1={0} y1={y} x2={cW} y2={y} stroke="#1a2535" strokeWidth="1" strokeDasharray="4,4" />
            <text x={-6} y={y + 4} textAnchor="end" fill="#3d5470" fontSize="9.5" fontFamily="monospace">
              ₹{val >= 1000 ? (val / 1000).toFixed(1) + "K" : val.toFixed(0)}
            </text>
          </g>
        ))}
        <path d={`${closeLine} L${sx(visible.length - 1)},${cH} L${sx(0)},${cH} Z`} fill="url(#indGrad)" />
        {visible.map((d, i) => {
          const x = sx(i);
          const up = d.close >= d.open;
          const color = up ? "#138808" : "#FF2400";
          const bTop = sy(Math.max(d.open, d.close));
          const bBot = sy(Math.min(d.open, d.close));
          const bH = Math.max(1, bBot - bTop);
          return (
            <g key={i}>
              <line x1={x} y1={sy(d.high)} x2={x} y2={sy(d.low)} stroke={color} strokeWidth="1" opacity="0.7" />
              <rect x={x - cw / 2} y={bTop} width={cw} height={bH} fill={color} opacity="0.88" rx="1" />
            </g>
          );
        })}
        <path d={closeLine} fill="none" stroke="#FF9933" strokeWidth="1.5" opacity="0.45" filter="url(#glow2)" />
        <line x1={0} y1={sy(visible[visible.length - 1].close)} x2={cW} y2={sy(visible[visible.length - 1].close)}
          stroke="#FF9933" strokeWidth="1" strokeDasharray="5,3" opacity="0.5" />
      </g>
    </svg>
  );
}

function VolumeBar({ data }) {
  const visible = data.slice(-44);
  const maxVol = Math.max(...visible.map(d => d.volume));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", height: 44, gap: 1 }}>
      {visible.map((d, i) => (
        <div key={i} style={{
          flex: 1, minWidth: 2,
          height: `${(d.volume / maxVol) * 100}%`,
          background: d.close >= d.open ? "rgba(19,136,8,0.45)" : "rgba(255,36,0,0.38)",
          borderRadius: "1px 1px 0 0"
        }} />
      ))}
    </div>
  );
}

function Chip({ label, value, sub, color }) {
  return (
    <div style={{
      flex: 1, background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "11px 14px", minWidth: 100
    }}>
      <div style={{ fontSize: 9, color: "#3d5470", letterSpacing: 1, marginBottom: 5, fontFamily: "monospace" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#3d5470", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function IndianStockDashboard() {
  const [selected, setSelected] = useState(STOCKS[0]);
  const [candleData, setCandleData] = useState(() => generateCandleData(STOCKS[0].price));
  const [signal, setSignal] = useState(() => generateSignal(generateCandleData(STOCKS[0].price)));
  const [tab, setTab] = useState("chart");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiText, setAiText] = useState("");
  const [prices, setPrices] = useState(STOCKS.map(s => ({ ...s })));
  const [indices, setIndices] = useState(INDICES.map(i => ({ ...i })));
  const [time, setTime] = useState(new Date());
  const [fundData] = useState(() =>
    STOCKS.reduce((acc, s) => {
      acc[s.symbol] = {
        marketCap: formatINR(s.price * (Math.random() * 5e9 + 1e9)),
        pe: (15 + Math.random() * 35).toFixed(2),
        eps: (s.price / (15 + Math.random() * 20)).toFixed(2),
        bookValue: (s.price * (0.4 + Math.random() * 0.4)).toFixed(2),
        divYield: (0.5 + Math.random() * 3).toFixed(2),
        high52: (s.price * (1.08 + Math.random() * 0.12)).toFixed(2),
        low52: (s.price * (0.72 + Math.random() * 0.1)).toFixed(2),
        beta: (0.7 + Math.random() * 0.8).toFixed(2),
        fii: (12 + Math.random() * 30).toFixed(2),
        dii: (8 + Math.random() * 20).toFixed(2),
        promoter: (40 + Math.random() * 30).toFixed(2),
        avgVol: formatINR(Math.floor(Math.random() * 8e7 + 2e7)),
      };
      return acc;
    }, {})
  );

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
      setPrices(prev => prev.map(s => {
        const delta = (Math.random() - 0.49) * s.price * 0.0015;
        const newPrice = +(s.price + delta).toFixed(2);
        const newChange = +(s.change + delta).toFixed(2);
        return { ...s, price: newPrice, change: newChange, changePct: +((newChange / Math.max(1, newPrice - newChange)) * 100).toFixed(2) };
      }));
      setIndices(prev => prev.map(idx => {
        const delta = (Math.random() - 0.49) * idx.value * 0.0008;
        return { ...idx, value: +(idx.value + delta).toFixed(2), change: +(idx.change + delta).toFixed(2) };
      }));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const data = generateCandleData(selected.price);
    setCandleData(data);
    setSignal(generateSignal(data));
    setAiText("");
  }, [selected.symbol]);

  const runAI = async () => {
    setAnalyzing(true);
    setAiText("");
    try {
      const s = selected;
      const sig = signal;
      const prompt = `You are an expert SEBI-registered equity research analyst specializing in Indian stock markets (NSE/BSE). Analyze ${s.name} (${s.symbol}) listed on ${s.exchange}:

- Current Price: ₹${s.price}
- Daily Change: ${s.change > 0 ? "+" : ""}₹${s.change} (${s.changePct}%)
- Sector: ${s.sector}
- Trend: ${sig?.trend} (Strength: ${sig?.strength}%)
- RSI: ${sig?.rsi}
- MACD: ${sig?.macd}
- Support: ₹${sig?.support}
- Resistance: ₹${sig?.resistance}

Write a 4-5 sentence professional equity research note for Indian retail investors. Cover: current momentum, sectoral outlook in India (SEBI/RBI context if relevant), key price levels, and short-term view. Use Indian market context (FII/DII, rupee, Budget impact if relevant). Use ₹ for all prices. End with a brief risk note.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      setAiText(data.content?.map(b => b.text || "").join("") || "Analysis unavailable.");
    } catch {
      setAiText("Failed to fetch analysis. Please try again.");
    }
    setAnalyzing(false);
  };

  const cur = prices.find(p => p.symbol === selected.symbol) || selected;
  const isUp = cur.change >= 0;
  const fd = fundData[selected.symbol] || {};

  const ist = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const istStr = ist.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const istDate = ist.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#04080f", color: "#ddeaf8", fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Index ticker bar */}
      <div style={{
        background: "#060d18", borderBottom: "1px solid rgba(255,153,51,0.2)",
        padding: "7px 20px", display: "flex", alignItems: "center", gap: 28, overflowX: "auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 18, height: 12, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ flex: 1, background: "#FF9933" }} />
            <div style={{ flex: 1, background: "#fff" }} />
            <div style={{ flex: 1, background: "#138808" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#FF9933", letterSpacing: 2 }}>NSE · BSE</span>
        </div>
        {indices.map(idx => (
          <div key={idx.name} style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: "#3d5470" }}>{idx.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            <span style={{ fontSize: 9, color: idx.change >= 0 ? "#138808" : "#FF2400" }}>
              {idx.change >= 0 ? "▲" : "▼"} {Math.abs(idx.changePct).toFixed(2)}%
            </span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#FF9933" }}>IST {istStr}</div>
          <div style={{ fontSize: 9, color: "#3d5470" }}>{istDate}</div>
        </div>
      </div>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,153,51,0.1)", padding: "13px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,153,51,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg, #FF9933 0%, #138808 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 900, color: "#fff"
          }}>₹</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: "#FF9933" }}>DALAL PULSE</div>
            <div style={{ fontSize: 9, color: "#3d5470", letterSpacing: 1.5 }}>INDIAN EQUITY RESEARCH TERMINAL</div>
          </div>
        </div>
        <div style={{ fontSize: 9, padding: "3px 10px", borderRadius: 4, background: "rgba(19,136,8,0.15)", border: "1px solid rgba(19,136,8,0.3)", color: "#138808" }}>
          ● MARKET OPEN
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: 205, borderRight: "1px solid rgba(255,255,255,0.04)", padding: "10px 0", flexShrink: 0 }}>
          <div style={{ padding: "4px 14px 8px", fontSize: 9, color: "#3d5470", letterSpacing: 2 }}>WATCHLIST</div>
          {prices.map(stock => (
            <div key={stock.symbol} onClick={() => setSelected(stock)} style={{
              padding: "9px 14px", cursor: "pointer",
              background: selected.symbol === stock.symbol ? "rgba(255,153,51,0.07)" : "transparent",
              borderLeft: selected.symbol === stock.symbol ? "2px solid #FF9933" : "2px solid transparent",
              transition: "all 0.15s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: selected.symbol === stock.symbol ? "#FF9933" : "#ddeaf8" }}>
                  {stock.symbol}
                </span>
                <span style={{ fontSize: 9, color: stock.change >= 0 ? "#138808" : "#FF2400" }}>
                  {stock.change >= 0 ? "▲" : "▼"}{Math.abs(stock.changePct).toFixed(2)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 8, color: "#3d5470" }}>{stock.sector}</span>
                <span style={{ fontSize: 10, color: "#7a9cbb" }}>₹{stock.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "18px 22px", minWidth: 0 }}>
          {/* Stock Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{cur.symbol}</h1>
                <span style={{ fontSize: 9, color: "#3d5470", background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 4 }}>{cur.exchange}</span>
                <span style={{ fontSize: 9, color: "#3d5470", background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 4 }}>{cur.sector}</span>
                {signal && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 9px", borderRadius: 4,
                    background: signal.trend === "BULLISH" ? "rgba(19,136,8,0.15)" : "rgba(255,36,0,0.12)",
                    color: signal.trend === "BULLISH" ? "#138808" : "#FF2400",
                    border: `1px solid ${signal.trend === "BULLISH" ? "rgba(19,136,8,0.3)" : "rgba(255,36,0,0.3)"}`
                  }}>{signal.trend} · {signal.strength}%</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: "#3d5470", marginTop: 4 }}>{cur.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace" }}>
                ₹{cur.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 12, color: isUp ? "#138808" : "#FF2400", fontWeight: 700 }}>
                {isUp ? "+" : ""}₹{cur.change.toFixed(2)} ({isUp ? "+" : ""}{cur.changePct.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* Indicators */}
          {signal && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <Chip label="RSI (14)" value={signal.rsi}
                sub={+signal.rsi > 70 ? "Overbought" : +signal.rsi < 30 ? "Oversold" : "Neutral"}
                color={+signal.rsi > 70 ? "#FF2400" : +signal.rsi < 30 ? "#138808" : "#7a9cbb"} />
              <Chip label="MACD" value={signal.macd} sub="Signal line"
                color={parseFloat(signal.macd) > 0 ? "#138808" : "#FF2400"} />
              <Chip label="SUPPORT" value={`₹${Number(signal.support).toLocaleString("en-IN")}`}
                sub="Floor level" color="#FF9933" />
              <Chip label="RESISTANCE" value={`₹${Number(signal.resistance).toLocaleString("en-IN")}`}
                sub="Ceiling level" color="#FF9933" />
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {["chart", "ai analysis", "fundamentals"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "7px 16px", fontSize: 9, letterSpacing: 1.5,
                color: tab === t ? "#FF9933" : "#3d5470",
                borderBottom: tab === t ? "2px solid #FF9933" : "2px solid transparent",
                fontFamily: "inherit", textTransform: "uppercase"
              }}>{t}</button>
            ))}
          </div>

          {/* Chart Tab */}
          {tab === "chart" && (
            <div style={{ background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.045)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, color: "#3d5470", letterSpacing: 1.5, marginBottom: 10 }}>
                PRICE ACTION · 60 SESSIONS · C