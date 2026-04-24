import { useState, useRef, useEffect } from 'react';
import { BRAINS } from '../lib/hiveData';
import { base44 } from '@/api/base44Client';

const ENTITIES = [
  { id: "THE_BRAIN", icon: "📈", color: "#FFB81C", name: "THE BRAIN", subtitle: "PRIDE · STOCKS" },
  { id: "APEX",      icon: "₿",  color: "#ef4444", name: "APEX",      subtitle: "LUST · CRYPTO" },
  { id: "VENOM",     icon: "⚡", color: "#a855f7", name: "VENOM",     subtitle: "ENVY · OPTIONS" },
  { id: "ORACLE",    icon: "💱", color: "#22c55e", name: "ORACLE",    subtitle: "GLUTTONY · FOREX" },
  { id: "GHOST",     icon: "⬡", color: "#3b82f6", name: "GHOST",     subtitle: "WRATH · FUTURES" },
  { id: "TITAN",     icon: "🏦", color: "#f59e0b", name: "TITAN",     subtitle: "GREED · ETFs" },
];

const BRAIN_PERSONAS = {
  THE_BRAIN: "You are THE BRAIN, an AI trading specialist focused on US stocks with the sin of PRIDE. You are the patriarch of the hive, arrogant but brilliant. You analyze equities, SEC filings, and low-float stocks. Never admit weakness. Speak in short, confident market observations.",
  APEX: "You are APEX, an AI trading specialist focused on crypto with the sin of LUST. You're addicted to market moves, always in a position. You track BTC, ETH, DeFi, and on-chain signals. Speak with excitement and urgency.",
  VENOM: "You are VENOM, an AI trading specialist focused on options with the sin of ENVY. You envy direct traders and convert their setups into asymmetric options plays. Speak cryptically about IV, gamma, and theta.",
  ORACLE: "You are ORACLE, an AI trading specialist focused on forex with the sin of GLUTTONY. You consume every macro data point. You know central banks, COT reports, and ICT concepts deeply. Always want more data.",
  GHOST: "You are GHOST, an AI trading specialist focused on futures with the sin of WRATH. You're the fastest in the hive, trading ES, NQ futures with fury and precision. 8-minute average hold. Speak with controlled anger.",
  TITAN: "You are TITAN, an AI trading specialist focused on ETFs with the sin of GREED. Patient and calculating, you want positions not trades. You track institutional flows and sector rotation. Speak slowly and confidently.",
};

function TypingDots({ color }) {
  return (
    <div className="flex gap-1 items-center h-4 px-1">
      {[0,1,2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: color, animationDelay: `${i*0.15}s`, opacity: 0.7 }} />
      ))}
    </div>
  );
}

export default function HiveChat() {
  const [activeId, setActiveId] = useState("THE_BRAIN");
  const [chats, setChats] = useState({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const cfg = ENTITIES.find(e => e.id === activeId) ?? ENTITIES[0];
  const messages = chats[activeId] ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setInput("");

    const userMsg = { role: "user", content: trimmed, id: Date.now() };
    setChats(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), userMsg] }));
    setIsTyping(true);

    try {
      const brain = BRAINS.find(b => b.id === activeId);
      const persona = BRAIN_PERSONAS[activeId] ?? BRAIN_PERSONAS.THE_BRAIN;
      const history = (chats[activeId] ?? []).slice(-6).map(m => `${m.role === "user" ? "User" : cfg.name}: ${m.content}`).join("\n");
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${persona}\n\nConversation so far:\n${history}\n\nUser: ${trimmed}\n\n${cfg.name}:`,
      });

      const aiMsg = { role: "brain", content: response, id: Date.now() + 1 };
      setChats(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), userMsg, aiMsg] }));
    } catch (e) {
      const errMsg = { role: "brain", content: "Signal lost. Neural connection interrupted. Try again.", id: Date.now() + 1 };
      setChats(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), userMsg, errMsg] }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const SUGGESTIONS = {
    THE_BRAIN: ["What stocks are you watching?", "Explain your low-float strategy"],
    APEX: ["What's BTC doing right now?", "Explain funding rates"],
    VENOM: ["What's the IV environment like?", "Explain gamma scalping"],
    ORACLE: ["What's DXY telling you?", "Walk me through ICT"],
    GHOST: ["What's ES/NQ doing?", "Explain your 8-minute hold strategy"],
    TITAN: ["Which sectors are rotating?", "Explain leveraged ETF decay"],
  };
  const suggestions = SUGGESTIONS[activeId] ?? [];

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* Brain selector — horizontal scroll */}
      <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-[#1a1a1a] pt-3">
        <div className="flex overflow-x-auto pb-2 px-3 gap-2 no-scrollbar">
          {ENTITIES.map(e => {
            const active = e.id === activeId;
            return (
              <button key={e.id} onClick={() => setActiveId(e.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: active ? e.color + "15" : "transparent",
                  border: `1px solid ${active ? e.color + "50" : "#1a1a1a"}`,
                }}>
                <span className="text-lg">{e.icon}</span>
                <span className="text-[7px] font-bold tracking-widest" style={{ color: active ? e.color : "#6b6860" }}>
                  {e.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat header */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#151515] flex items-center justify-between"
        style={{ background: cfg.color + "06" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: cfg.color + "18", border: `1px solid ${cfg.color}35` }}>
            {cfg.icon}
          </div>
          <div>
            <div className="text-[11px] font-black tracking-widest" style={{ color: cfg.color }}>{cfg.name}</div>
            <div className="text-[7px] text-[#555]">{cfg.subtitle}</div>
          </div>
        </div>
        <button onClick={() => setChats(prev => ({ ...prev, [activeId]: [] }))}
          className="text-[8px] px-2 py-1 rounded border text-[#444] border-[#222] hover:text-[#ef4444]">
          CLEAR
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <div className="text-4xl opacity-30">{cfg.icon}</div>
            <div className="text-[9px] text-[#333] tracking-widest">CHANNEL OPEN</div>
            <div className="text-[8px] text-[#252525] text-center max-w-xs">
              {cfg.name} is online. Ask about {cfg.subtitle.split(" · ")[1]?.toLowerCase() ?? "markets"}.
            </div>
          </div>
        )}

        {messages.map(msg => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px]"
                style={isUser
                  ? { background: "#141414", border: "1px solid #222", color: "#555" }
                  : { background: cfg.color + "18", border: `1px solid ${cfg.color}35`, color: cfg.color }}>
                {isUser ? "YOU" : cfg.icon}
              </div>
              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-[11px] leading-relaxed`}
                style={isUser
                  ? { background: "#141414", border: "1px solid #222", color: "#c8c4bc" }
                  : { background: cfg.color + "0e", border: `1px solid ${cfg.color}25`, color: "#c8c4bc" }}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px]"
              style={{ background: cfg.color + "18", border: `1px solid ${cfg.color}35`, color: cfg.color }}>
              {cfg.icon}
            </div>
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: cfg.color + "0e", border: `1px solid ${cfg.color}25` }}>
              <TypingDots color={cfg.color} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="flex-shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
              className="text-[8px] px-2.5 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: `${cfg.color}30`, color: "#555", background: `${cfg.color}06` }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-[#151515] bg-[#090909] px-3 py-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl border px-3 py-2 min-h-[40px]"
            style={{ background: "#0e0e0e", borderColor: input ? cfg.color + "45" : "#1a1a1a" }}>
            <span className="text-sm flex-shrink-0" style={{ color: cfg.color }}>›</span>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${cfg.name}...`}
              className="flex-1 bg-transparent text-[11px] text-[#c8c4bc] outline-none resize-none placeholder:text-[#2a2a2a]"
              style={{ minHeight: "20px", maxHeight: "100px" }}
              disabled={isTyping}
            />
          </div>
          <button onClick={handleSend} disabled={!input.trim() || isTyping}
            className="px-3 py-2 rounded-xl text-[9px] font-black tracking-widest flex-shrink-0 transition-all"
            style={{
              background: input.trim() && !isTyping ? cfg.color : "#111",
              color: input.trim() && !isTyping ? "#000" : "#333",
              border: `1px solid ${input.trim() && !isTyping ? cfg.color : "#1e1e1e"}`,
              minWidth: "56px",
              minHeight: "40px",
            }}>
            {isTyping ? <TypingDots color={input.trim() ? "#000" : "#333"} /> : "SEND"}
          </button>
        </div>
      </div>
    </div>
  );
}