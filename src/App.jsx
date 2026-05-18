// ─── Finance Dashboard — Complete Rewrite ─────────────────────────────────────
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, Receipt,
  TrendingUp, Bot, Settings, LogOut, Plus,
  ChevronDown, ChevronLeft, Download, Upload,
  Eye, EyeOff, Trash2, CheckCircle2, Clock, Wallet,
  Bell, Search, Send, X, Edit2, Save, FileText, Calendar,
  AlertCircle, RefreshCw, Percent, Camera, Shield, Palette
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Storage helpers ──────────────────────────────────────────────────────────
const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const pkey = (pid, key) => `fin_${pid}_${key}`;

// ─── Formatting ───────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0);
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; } };
const fmtDateTime = (d) => { try { return new Date(d).toLocaleDateString("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" }); } catch { return "—"; } };
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

// ─── Constants ────────────────────────────────────────────────────────────────
const CATS = ["Assinaturas", "Compras", "Receitas", "Alimentação", "Saúde", "Lazer", "Transferência", "Moradia", "Transporte", "Outros"];
const PAYMENTS = ["Pix", "Crédito", "Débito", "Dinheiro", "Boleto", "TED/DOC"];
const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ASSET_TYPES = ["Renda Fixa", "Ações", "FIIs", "Cripto", "Exterior", "Poupança"];
const DONUT_COLORS = ["#7BCB68", "#60a5fa", "#f59e0b", "#f87171", "#c084fc", "#34d399", "#fb923c"];

const SEED_TX = [
  { id: 1, name: "Dribbble", amount: -12, category: "Assinaturas", date: new Date().toISOString(), payment: "Crédito", bank: "Nubank" },
  { id: 2, name: "Amazon", amount: -49.99, category: "Compras", date: new Date(Date.now() - 36e5).toISOString(), payment: "Débito", bank: "Itaú" },
  { id: 3, name: "Dianne Russell", amount: 250, category: "Receitas", date: new Date(Date.now() - 72e5).toISOString(), payment: "Pix", bank: "Nubank" },
  { id: 4, name: "Figma", amount: -20, category: "Assinaturas", date: new Date(Date.now() - 9e6).toISOString(), payment: "Crédito", bank: "Nubank" },
  { id: 5, name: "Zara", amount: -75, category: "Compras", date: new Date(Date.now() - 2e7).toISOString(), payment: "Crédito", bank: "Itaú" },
  { id: 6, name: "Stripe", amount: 860, category: "Receitas", date: new Date(Date.now() - 3e7).toISOString(), payment: "Pix", bank: "Nubank" },
];
const SEED_CARDS = [
  { id: 1, bank: "Nubank", number: "6566 8866 6364 4332", limit: 60000, balance: 4520.34, due: "09/25", color: "#7BCB68" },
  { id: 2, bank: "Itaú", number: "5412 3300 8821 9988", limit: 15000, balance: 1200, due: "12/26", color: "#60a5fa" },
];
const SEED_FIXED = [
  { id: 1, name: "Aluguel", amount: 2200, status: "Pago", installment: null, month: new Date().toISOString().slice(0, 7) },
  { id: 2, name: "Financiamento Auto", amount: 890, status: "Pendente", installment: { current: 8, total: 48 }, month: new Date().toISOString().slice(0, 7) },
  { id: 3, name: "Empréstimo Pessoal", amount: 500, status: "Pendente", installment: { current: 3, total: 12 }, month: new Date().toISOString().slice(0, 7) },
  { id: 4, name: "Internet", amount: 120, status: "Pago", installment: null, month: new Date().toISOString().slice(0, 7) },
];
const SEED_INVOICES = [
  { id: 1, name: "Adobe Creative", amount: 20.99, dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), status: "Pendente", recurring: true },
  { id: 2, name: "Freepik", amount: 15, dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), status: "Pendente", recurring: false },
  { id: 3, name: "Google One", amount: 12, dueDate: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10), status: "Pendente", recurring: true },
  { id: 4, name: "Netflix", amount: 55.90, dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10), status: "Pago", recurring: true },
];
const SEED_ASSETS = [
  { id: 1, name: "Tesouro Selic 2029", type: "Renda Fixa", amount: 12500, cdiMult: 1.0, manualReturn: 0, purchaseDate: "2024-01-15" },
  { id: 2, name: "PETR4", type: "Ações", amount: 3200, cdiMult: 0, manualReturn: -1.2, purchaseDate: "2024-03-10" },
  { id: 3, name: "MXRF11", type: "FIIs", amount: 5800, cdiMult: 0, manualReturn: 0.9, purchaseDate: "2024-02-20" },
  { id: 4, name: "Bitcoin", type: "Cripto", amount: 2100, cdiMult: 0, manualReturn: 8.3, purchaseDate: "2024-04-01" },
];
const SEED_GOALS = [
  { id: 1, name: "Reserva de Emergência", target: 30000, current: 18500, color: "#7BCB68", deadline: "2025-12-31" },
  { id: 2, name: "Viagem Europa", target: 15000, current: 4200, color: "#60a5fa", deadline: "2026-06-30" },
  { id: 3, name: "MacBook Pro", target: 12000, current: 9800, color: "#f59e0b", deadline: "2025-09-01" },
];

// ─── Theme ────────────────────────────────────────────────────────────────────
const makeTheme = (accent = "#7BCB68") => ({
  bg: "#EEF5E7", card: "#F8FAF5", accent,
  text: "#1D1D1D", muted: "#7B7B7B", border: "#DFF0D8",
  danger: "#EF4444", warn: "#F59E0B",
  shadow: "0 2px 16px rgba(100,160,80,0.08)",
});

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => {
  const T = makeTheme();
  return <div style={{ background: T.card, borderRadius: 28, padding: 24, boxShadow: T.shadow, ...style }}>{children}</div>;
};

const Btn = ({ children, variant = "primary", accent = "#7BCB68", small, full, onClick, disabled, style = {} }) => {
  const variants = {
    primary: { background: accent, color: "#fff" },
    ghost: { background: "#EEF5E7", color: "#1D1D1D" },
    danger: { background: "#FEE2E2", color: "#EF4444" },
    outline: { background: "transparent", border: "1.5px solid #DFF0D8", color: "#7B7B7B" },
  };
  return (
    <button disabled={disabled} onClick={onClick}
      style={{ padding: small ? "7px 14px" : "11px 20px", borderRadius: small ? 10 : 14, fontWeight: 700, fontSize: small ? 12 : 13, border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 6, width: full ? "100%" : "auto", justifyContent: full ? "center" : "flex-start", transition: "opacity .15s", ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

const FInput = ({ label, value, onChange, type = "text", placeholder, style = {} }) => {
  const T = makeTheme();
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box", ...style }} />
    </div>
  );
};

const FSelect = ({ label, value, onChange, options, style = {} }) => {
  const T = makeTheme();
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: "#EEF5E7", color: "#1D1D1D", outline: "none", boxSizing: "border-box", ...style }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
};

const Badge = ({ children, color = "#7B7B7B", bg = "#EEF5E7" }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "3px 10px", borderRadius: 20 }}>{children}</span>
);

// ─── Physical Card ─────────────────────────────────────────────────────────────
const PhysicalCard = ({ card, selected, onClick, compact }) => {
  const W = compact ? 148 : 210, H = compact ? 88 : 126, R = compact ? 14 : 20;
  return (
    <div onClick={onClick} style={{ width: W, height: H, borderRadius: R, background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}bb 100%)`, padding: compact ? "12px 14px" : "18px 20px", boxShadow: selected ? `0 8px 32px ${card.color}66` : "0 4px 16px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden", color: "#fff", flexShrink: 0, cursor: onClick ? "pointer" : "default", border: selected ? "2.5px solid #fff" : "2.5px solid transparent", transition: "all .2s", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", bottom: -30, left: 0, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: compact ? 8 : 14 }}>
        <Wallet size={compact ? 14 : 17} color="rgba(255,255,255,0.9)" />
        <span style={{ fontSize: compact ? 9 : 11, fontWeight: 700, opacity: 0.85 }}>{card.bank}</span>
      </div>
      <p style={{ fontSize: compact ? 9 : 11, letterSpacing: compact ? 1 : 2, margin: `0 0 ${compact ? 4 : 8}px`, opacity: 0.88 }}>{card.number}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: compact ? 8 : 9, opacity: 0.7, margin: 0 }}>Saldo</p>
          <p style={{ fontSize: compact ? 11 : 14, fontWeight: 700, margin: 0 }}>{fmt(card.balance)}</p>
        </div>
        <p style={{ fontSize: compact ? 8 : 9, opacity: 0.7, margin: 0 }}>Válido {card.due}</p>
      </div>
    </div>
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ profiles, onLogin, onCreateProfile, accent }) {
  const T = makeTheme(accent);
  const [mode, setMode] = useState("select");
  const [selProfile, setSelProfile] = useState(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");

  const doLogin = () => {
    if (password === selProfile.password) { setErr(""); onLogin(selProfile); }
    else setErr("Senha incorreta.");
  };
  const doCreate = () => {
    if (!newName.trim() || !newPass.trim()) { setErr("Preencha todos os campos."); return; }
    const p = { id: Date.now(), name: newName.trim(), password: newPass, avatar: null };
    onCreateProfile(p); setMode("login"); setSelProfile(p); setPassword(newPass); setErr("");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        style={{ background: T.card, borderRadius: 32, padding: "44px 40px", width: 400, boxShadow: "0 8px 48px rgba(100,160,80,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ background: T.accent, borderRadius: 12, padding: 8 }}><Wallet size={22} color="#fff" /></div>
          <span style={{ fontWeight: 800, fontSize: 22, color: T.text }}>Finance.</span>
        </div>

        {mode === "select" && (<>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6 }}>Selecione o perfil</h2>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 22 }}>Escolha um perfil para continuar</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {profiles.map(p => (
              <button key={p.id} onClick={() => { setSelProfile(p); setMode("login"); setErr(""); setPassword(""); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.accent, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.avatar ? <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{p.name[0].toUpperCase()}</span>}
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{p.name}</span>
              </button>
            ))}
          </div>
          <Btn full accent={T.accent} onClick={() => { setMode("create"); setErr(""); }}><Plus size={15} /> Novo Perfil</Btn>
        </>)}

        {mode === "login" && selProfile && (<>
          <button onClick={() => { setMode("select"); setPassword(""); setErr(""); }} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16 }}>
            <ChevronLeft size={15} /> Voltar
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.accent, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selProfile.avatar ? <img src={selProfile.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{selProfile.name[0].toUpperCase()}</span>}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>{selProfile.name}</p>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Digite a senha para entrar</p>
            </div>
          </div>
          <div style={{ marginBottom: 20, position: "relative" }}>
            <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} placeholder="Senha"
              style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 14, border: `1.5px solid ${T.border}`, fontSize: 14, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {err && <p style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <Btn full accent={T.accent} onClick={doLogin}>Entrar</Btn>
          <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 14 }}>Senha padrão: <b>1234</b></p>
        </>)}

        {mode === "create" && (<>
          <button onClick={() => { setMode("select"); setErr(""); }} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16 }}>
            <ChevronLeft size={15} /> Voltar
          </button>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 20 }}>Criar Novo Perfil</h3>
          <FInput label="Nome do Perfil" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: João Silva" />
          <FInput label="Senha" value={newPass} onChange={e => setNewPass(e.target.value)} type="password" placeholder="Crie uma senha" />
          {err && <p style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <Btn full accent={T.accent} onClick={doCreate}><Plus size={15} /> Criar Perfil</Btn>
        </>)}
      </motion.div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "principal" },
  { id: "transactions", label: "Transações", icon: ArrowLeftRight, group: "principal" },
  { id: "cards", label: "Cartão", icon: CreditCard, group: "principal" },
  { id: "fixed", label: "Despesas Fixas", icon: Receipt, group: "principal" },
  { id: "invoices", label: "Faturas", icon: FileText, group: "principal" },
  { id: "investments", label: "Investimentos", icon: TrendingUp, group: "principal" },
  { id: "ai", label: "Assistente IA", icon: Bot, group: "geral" },
  { id: "settings", label: "Configurações", icon: Settings, group: "geral" },
];

function Sidebar({ active, setActive, profile, onLogout, accent, allProfiles, onSwitchProfile }) {
  const T = makeTheme(accent);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ width: 228, minWidth: 228, background: T.card, height: "100vh", display: "flex", flexDirection: "column", padding: "22px 13px 18px", boxShadow: "2px 0 12px rgba(0,0,0,0.03)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, paddingLeft: 8 }}>
        <div style={{ background: T.accent, borderRadius: 10, padding: 7 }}><Wallet size={17} color="#fff" /></div>
        <span style={{ fontWeight: 800, fontSize: 18, color: T.text }}>Finance.</span>
      </div>

      {["principal", "geral"].map(grp => (
        <div key={grp}>
          <p style={{ fontSize: 10, fontWeight: 800, color: T.accent, margin: "6px 0 5px 10px", letterSpacing: 1.2, textTransform: "uppercase" }}>{grp === "principal" ? "Menu Principal" : "Geral"}</p>
          {NAV.filter(n => n.group === grp).map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: isActive ? T.accent : "transparent", color: isActive ? "#fff" : T.muted, fontWeight: isActive ? 700 : 500, fontSize: 13, transition: "all .15s", marginBottom: 2, textAlign: "left" }}>
                <Icon size={16} />{item.label}
              </button>
            );
          })}
        </div>
      ))}

      <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: "transparent", color: T.muted, fontWeight: 500, fontSize: 13, marginTop: 4 }}>
        <LogOut size={16} />Sair
      </button>

      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${T.border}`, position: "relative" }}>
        <button onClick={() => setShowMenu(!showMenu)}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px", background: "none", border: "none", cursor: "pointer", borderRadius: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accent, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {profile?.avatar ? <img src={profile.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{(profile?.name || "U")[0].toUpperCase()}</span>}
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{profile?.name || "Usuário"}</p>
            <p style={{ fontSize: 10, color: T.accent, margin: 0 }}>Ver perfil</p>
          </div>
          <ChevronDown size={14} color={T.muted} />
        </button>
        <AnimatePresence>
          {showMenu && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ position: "absolute", bottom: "100%", left: 0, right: 0, background: T.card, borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "8px", zIndex: 200, marginBottom: 4 }}>
              {allProfiles.filter(p => p.id !== profile?.id).map(p => (
                <button key={p.id} onClick={() => { onSwitchProfile(p); setShowMenu(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: T.text, fontSize: 12, fontWeight: 600 }}>
                  <RefreshCw size={13} />Trocar para {p.name}
                </button>
              ))}
              <div style={{ borderTop: `1px solid ${T.border}`, margin: "4px 0" }} />
              <button onClick={() => { onLogout(); setShowMenu(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: makeTheme().danger, fontSize: 12, fontWeight: 600 }}>
                <LogOut size={13} />Sair
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ profile, onLogout, invoices, fixedExpenses, accent, searchQuery, setSearchQuery, onSwitchProfile, allProfiles }) {
  const T = makeTheme(accent);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const notifications = useMemo(() => {
    const n = [];
    invoices.forEach(inv => {
      const d = daysUntil(inv.dueDate);
      if (inv.status !== "Pago" && d <= 7) n.push({ text: `${inv.name} vence em ${d <= 0 ? "hoje/ontem" : d + " dia(s)"}`, urgent: d <= 2, name: inv.name, amount: inv.amount });
    });
    fixedExpenses.forEach(f => {
      if (f.status === "Pendente") n.push({ text: `${f.name} está pendente`, urgent: false, name: f.name, amount: f.amount });
    });
    return n;
  }, [invoices, fixedExpenses]);

  return (
    <div style={{ background: T.card, padding: "13px 26px", display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 90 }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
        <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar transações, metas, faturas..."
          style={{ padding: "9px 36px", borderRadius: 14, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", width: "100%", boxSizing: "border-box" }} />
        {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={13} /></button>}
      </div>

      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", position: "relative", padding: 4 }}>
          <Bell size={20} />
          {notifications.length > 0 && <span style={{ position: "absolute", top: 0, right: 0, width: 9, height: 9, background: T.danger, borderRadius: "50%", border: `2px solid ${T.card}` }} />}
        </button>
        <AnimatePresence>
          {showNotif && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
              style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", background: T.card, borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.14)", width: 320, zIndex: 300, padding: 16, maxHeight: 360, overflowY: "auto" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 12 }}>Notificações</p>
              {notifications.length === 0 && <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>Tudo em dia! ✅</p>}
              {notifications.map((n, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: 10, borderRadius: 12, background: n.urgent ? "#FEF2F2" : T.bg, marginBottom: 8 }}>
                  <AlertCircle size={16} color={n.urgent ? T.danger : T.warn} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{n.name}</p>
                    <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{n.text}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: n.urgent ? T.danger : T.warn, margin: "2px 0 0" }}>{fmt(n.amount)}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
          style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accent, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {profile?.avatar ? <img src={profile.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{(profile?.name || "U")[0].toUpperCase()}</span>}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{profile?.name || "Usuário"}</p>
            <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Área de trabalho</p>
          </div>
          <ChevronDown size={14} color={T.muted} />
        </button>
        <AnimatePresence>
          {showUser && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", background: T.card, borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", width: 200, zIndex: 300, padding: 8 }}>
              {allProfiles.filter(p => p.id !== profile?.id).map(p => (
                <button key={p.id} onClick={() => { onSwitchProfile(p); setShowUser(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: T.text, fontSize: 13, fontWeight: 600 }}>
                  <RefreshCw size={13} />Trocar para {p.name}
                </button>
              ))}
              <div style={{ borderTop: `1px solid ${T.border}`, margin: "4px 0" }} />
              <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: T.danger, fontSize: 13, fontWeight: 600 }}>
                <LogOut size={13} />Sair
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ transactions, cards, accent, searchQuery }) {
  const T = makeTheme(accent);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const activeCard = cards[activeCardIdx] || cards[0];

  const balance = transactions.reduce((a, t) => a + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  const catMap = {};
  transactions.filter(t => t.amount < 0).forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount); });
  const donutData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const weekData = WEEK.map((d, i) => {
    const dayTx = transactions.filter(t => new Date(t.date).getDay() === i);
    return { name: d, entradas: dayTx.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0), saidas: dayTx.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0) };
  });

  const recent = searchQuery
    ? transactions.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : transactions.slice(0, 8);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ color: T.muted, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Saldo Disponível</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, color: T.text, margin: "0 0 4px" }}>{fmt(balance)}</h1>
              <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>Saldo Cartão</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{activeCard ? fmt(activeCard.balance) : "—"}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.muted }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>Limite</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{activeCard ? fmt(activeCard.limit) : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
            {activeCard && <PhysicalCard card={activeCard} />}
          </div>
          {cards.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {cards.map((c, i) => (
                <PhysicalCard key={c.id} card={c} compact selected={i === activeCardIdx} onClick={() => setActiveCardIdx(i)} />
              ))}
            </div>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: T.accent, borderRadius: 24, padding: "20px 22px", boxShadow: T.shadow, flex: 1 }}>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 4 }}>Entradas</p>
            <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>{fmt(income)}</p>
          </div>
          <div style={{ background: "#1D1D1D", borderRadius: 24, padding: "20px 22px", boxShadow: T.shadow, flex: 1 }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 4 }}>Saídas</p>
            <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>{fmt(expenses)}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>Resumo de Gastos por Categoria</p>
          <div style={{ flex: 1, minHeight: 200, position: "relative" }}>
            <ResponsiveContainer width="99%" height={240}>
              <PieChart>
                <Pie data={donutData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>Fluxo de Caixa Semanal</p>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="99%" height={240}>
              <BarChart data={weekData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.muted }} />
                <YAxis hide />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="entradas" fill={T.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 14 }}>{searchQuery ? "Resultados da busca global" : "Transações Recentes"}</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, textAlign: "left" }}>
                <th style={{ padding: "8px 12px", fontSize: 11, color: T.muted, fontWeight: 700 }}>Nome</th>
                <th style={{ padding: "8px 12px", fontSize: 11, color: T.muted, fontWeight: 700 }}>Categoria</th>
                <th style={{ padding: "8px 12px", fontSize: 11, color: T.muted, fontWeight: 700 }}>Banco / Meio</th>
                <th style={{ padding: "8px 12px", fontSize: 11, color: T.muted, fontWeight: 700 }}>Data</th>
                <th style={{ padding: "8px 12px", fontSize: 11, color: T.muted, fontWeight: 700, textAlign: "right" }}>Quantia</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAllign: "center", fontSize: 13, color: T.muted }}>Nenhuma transação encontrada.</td></tr>
              )}
              {recent.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.02)" }}>
                  <td style={{ padding: "12px", fontSize: 13, fontWeight: 700, color: T.text }}>{t.name}</td>
                  <td style={{ padding: "12px", fontSize: 12 }}><Badge>{t.category}</Badge></td>
                  <td style={{ padding: "12px", fontSize: 12, color: T.muted }}>{t.bank || "—"} • {t.payment || "—"}</td>
                  <td style={{ padding: "12px", fontSize: 12, color: T.muted }}>{fmtDate(t.date)}</td>
                  <td style={{ padding: "12px", fontSize: 13, fontWeight: 700, textAlign: "right", color: t.amount > 0 ? T.accent : T.text }}>
                    {t.amount > 0 ? `+ ${fmt(t.amount)}` : fmt(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tabs Modules Placeholder Interfaces ─────────────────────────────────────
function TransactionsTab({ transactions, setTransactions, cards, accent }) {
  const T = makeTheme(accent);
  const [fCat, setFCat] = useState("Todos");
  const [fBank, setFBank] = useState("Todos");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("Alimentação");
  const [pay, setPay] = useState("Pix");
  const [bank, setBank] = useState("Nubank");

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchCat = fCat === "Todos" || t.category === fCat;
      const matchBank = fBank === "Todos" || t.bank === fBank;
      return matchCat && matchBank;
    });
  }, [transactions, fCat, fBank]);

  const add = (e) => {
    e.preventDefault();
    if (!name || !amount) return;
    const isIncome = cat === "Receitas";
    const num = Math.abs(parseFloat(amount)) * (isIncome ? 1 : -1);
    const newTx = { id: Date.now(), name, amount: num, category: cat, date: new Date().toISOString(), payment: pay, bank };
    setTransactions([newTx, ...transactions]);
    setName(""); setAmount("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
      <Card>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>Lançar Transação</p>
        <form onSubmit={add}>
          <FInput label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Mercado Livre" />
          <FInput label="Valor (R$)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          <FSelect label="Categoria" value={cat} onChange={e => setCat(e.target.value)} options={CATS} />
          <FSelect label="Meio de Pagamento" value={pay} onChange={e => setPay(e.target.value)} options={PAYMENTS} />
          <FSelect label="Banco" value={bank} onChange={e => setBank(e.target.value)} options={["Nubank", "Itaú", "Bradesco", "Santander", "Outros"]} />
          <Btn full accent={T.accent} style={{ marginTop: 8 }}><Plus size={15} /> Adicionar</Btn>
        </form>
      </Card>
      <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <FSelect label="Filtro Categoria" value={fCat} onChange={e => setFCat(e.target.value)} options={["Todos", ...CATS]} style={{ marginBottom: 0 }} />
          <FSelect label="Filtro Banco" value={fBank} onChange={e => setFBank(e.target.value)} options={["Todos", "Nubank", "Itaú", "Bradesco", "Santander"]} style={{ marginBottom: 0 }} />
        </div>
        <div style={{ overflowY: "auto", flex: 1, maxHeight: 400 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.02)" }}>
                  <td style={{ padding: 10, fontSize: 13, fontWeight: 700 }}>{t.name}</td>
                  <td style={{ padding: 10 }}><Badge>{t.category}</Badge></td>
                  <td style={{ padding: 10, fontSize: 12, color: T.muted }}>{t.bank} • {t.payment}</td>
                  <td style={{ padding: 10, fontSize: 13, fontWeight: 700, textAlign: "right", color: t.amount > 0 ? T.accent : T.text }}>{fmt(t.amount)}</td>
                  <td style={{ padding: 10, textAlign: "right" }}>
                    <button onClick={() => setTransactions(transactions.filter(item => item.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CardsTab({ cards, setCards, accent }) {
  const T = makeTheme(accent);
  const [bank, setBank] = useState("");
  const [num, setNum] = useState("");
  const [lim, setLim] = useState("");
  const [bal, setBal] = useState("");
  const [due, setDue] = useState("");
  const [color, setColor] = useState("#7BCB68");
  const [editId, setEditId] = useState(null);

  const save = (e) => {
    e.preventDefault();
    if (!bank || !num) return;
    if (editId) {
      setCards(cards.map(c => c.id === editId ? { ...c, bank, number: num, limit: Number(lim), balance: Number(bal), due, color } : c));
      setEditId(null);
    } else {
      setCards([...cards, { id: Date.now(), bank, number: num, limit: Number(lim), balance: Number(bal), due, color }]);
    }
    setBank(""); setNum(""); setLim(""); setBal(""); setDue("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
      <Card>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>{editId ? "Editar Cartão" : "Cadastrar Cartão"}</p>
        <form onSubmit={save}>
          <FInput label="Banco" value={bank} onChange={e => setBank(e.target.value)} placeholder="Nubank" />
          <FInput label="Número do Cartão" value={num} onChange={e => setNum(e.target.value)} placeholder="0000 0000 0000 0000" />
          <FInput label="Limite (R$)" type="number" value={lim} onChange={e => setLim(e.target.value)} placeholder="5000" />
          <FInput label="Saldo Utilizado (R$)" type="number" value={bal} onChange={e => setBal(e.target.value)} placeholder="0" />
          <FInput label="Vencimento" value={due} onChange={e => setDue(e.target.value)} placeholder="10/29" />
          <FInput label="Cor do Cartão" type="color" value={color} onChange={e => setColor(e.target.value)} style={{ padding: 4, height: 38 }} />
          <Btn full accent={T.accent}>{editId ? "Salvar Alterações" : "Adicionar Cartão"}</Btn>
        </form>
      </Card>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        {cards.map(c => (
          <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <PhysicalCard card={c} />
            <div style={{ display: "flex", gap: 6 }}>
              <Btn small variant="ghost" accent={T.accent} onClick={() => { setEditId(c.id); setBank(c.bank); setNum(c.number); setLim(c.limit); setBal(c.balance); setDue(c.due); setColor(c.color); }}><Edit2 size={12} /> Editar</Btn>
              <Btn small variant="danger" onClick={() => setCards(cards.filter(item => item.id !== c.id))}><Trash2 size={12} /></Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FixedTab({ fixed, setFixed, accent }) {
  const T = makeTheme(accent);
  const [fMonth, setFMonth] = useState(new Date().toISOString().slice(0, 7));
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const filtered = useMemo(() => fixed.filter(f => !f.month || f.month === fMonth), [fixed, fMonth]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
      <Card>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>Nova Despesa Fixa</p>
        <form onSubmit={e => { e.preventDefault(); if(!name || !amount) return; setFixed([...fixed, { id: Date.now(), name, amount: Number(amount), status: "Pendente", installment: null, month: fMonth }]); setName(""); setAmount(""); }}>
          <FInput label="Nome da Conta" value={name} onChange={e => setName(e.target.value)} placeholder="Internet" />
          <FInput label="Valor Mensal (R$)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="150" />
          <Btn full accent={T.accent}>Adicionar</Btn>
        </form>
      </Card>
      <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justify: "space-between", items: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>Controle Mensal</p>
          <FInput type="month" value={fMonth} onChange={e => setFMonth(e.target.value)} style={{ marginBottom: 0, padding: "6px 12px" }} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.02)" }}>
                <td style={{ padding: 10, fontSize: 13, fontWeight: 700 }}>{f.name}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{fmt(f.amount)}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => setFixed(fixed.map(item => item.id === f.id ? { ...item, status: item.status === "Pago" ? "Pendente" : "Pago" } : item))}
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Badge color={f.status === "Pago" ? T.accent : T.warn} bg={f.status === "Pago" ? "#E8F5E9" : "#FFF3E0"}>{f.status}</Badge>
                  </button>
                </td>
                <td style={{ padding: 10, textAlign: "right" }}>
                  <button onClick={() => setFixed(fixed.filter(item => item.id !== f.id))} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function InvoicesTab({ invoices, setInvoices, accent, searchQuery }) {
  const T = makeTheme(accent);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery) return invoices;
    return invoices.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [invoices, searchQuery]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
      <Card>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>Lançar Fatura Avulsa</p>
        <form onSubmit={e => { e.preventDefault(); if(!name || !amount || !date) return; setInvoices([...invoices, { id: Date.now(), name, amount: Number(amount), dueDate: date, status: "Pendente" }]); setName(""); setAmount(""); setDate(""); }}>
          <FInput label="Descrição" value={name} onChange={e => setName(e.target.value)} placeholder="Adobe" />
          <FInput label="Valor" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          <FInput label="Vencimento" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <Btn full accent={T.accent}>Agendar Lembrete</Btn>
        </form>
        <div style={{ marginTop: 14, padding: 12, background: T.bg, borderRadius: 12, display: "flex", gap: 8, items: "center" }}>
          <Calendar size={16} color={T.accent} />
          <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>Sincronizado com Google Agenda</span>
        </div>
      </Card>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, textAlign: "left" }}>
              <th style={{ padding: 10, fontSize: 11, color: T.muted }}>Nome</th>
              <th style={{ padding: 10, fontSize: 11, color: T.muted }}>Vencimento</th>
              <th style={{ padding: 10, fontSize: 11, color: T.muted }}>Valor</th>
              <th style={{ padding: 10, fontSize: 11, color: T.muted }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.02)" }}>
                <td style={{ padding: 10, fontSize: 13, fontWeight: 700 }}>{i.name}</td>
                <td style={{ padding: 10, fontSize: 12, color: T.muted }}>{fmtDate(i.dueDate)}</td>
                <td style={{ padding: 10, fontSize: 13, fontWeight: 700 }}>{fmt(i.amount)}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => setInvoices(invoices.map(item => item.id === i.id ? { ...item, status: item.status === "Pago" ? "Pendente" : "Pago" } : item))} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Badge color={i.status === "Pago" ? T.accent : T.danger} bg={i.status === "Pago" ? "#E8F5E9" : "#FFEBEE"}>{i.status}</Badge>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function InvestmentsTab({ goals, setGoals, assets, setAssets, accent }) {
  const T = makeTheme(accent);
  const [aName, setAName] = useState("");
  const [aType, setAType] = useState("Renda Fixa");
  const [aAmount, setAAmount] = useState("");
  const [editAssetId, setEditAssetId] = useState(null);

  const saveAsset = (e) => {
    e.preventDefault();
    if (!aName || !aAmount) return;
    if (editAssetId) {
      setAssets(assets.map(a => a.id === editAssetId ? { ...a, name: aName, type: aType, amount: Number(aAmount) } : a));
      setEditAssetId(null);
    } else {
      setAssets([...assets, { id: Date.now(), name: aName, type: aType, amount: Number(aAmount), cdiMult: 1.0, manualReturn: 0, purchaseDate: new Date().toISOString().slice(0,10) }]);
    }
    setAName(""); setAAmount("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        <Card>
          <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>{editAssetId ? "Editar Ativo" : "Lançar Investimento"}</p>
          <form onSubmit={saveAsset}>
            <FInput label="Nome do Ativo / Ticket" value={aName} onChange={e => setAName(e.target.value)} placeholder="Ex: CDB Nubank ou PETR4" />
            <FSelect label="Tipo de Ativo" value={aType} onChange={e => setAType(e.target.value)} options={ASSET_TYPES} />
            <FInput label="Valor Alocado (R$)" type="number" value={aAmount} onChange={e => setAAmount(e.target.value)} placeholder="0.00" />
            <Btn full accent={T.accent}>{editAssetId ? "Salvar" : "Alocar Capital"}</Btn>
          </form>
        </Card>
        <Card>
          <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 12 }}>Carteira de Ativos (Rendimento Simulado CDI)</p>
          <div style={{ overflowY: "auto", maxHeight: 260 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.02)" }}>
                    <td style={{ padding: 10, fontSize: 13, fontWeight: 700 }}>{a.name}</td>
                    <td style={{ padding: 10 }}><Badge color="#60a5fa" bg="#eff6ff">{a.type}</Badge></td>
                    <td style={{ padding: 10, fontSize: 13, fontWeight: 700 }}>{fmt(a.amount)}</td>
                    <td style={{ padding: 10, fontSize: 11, color: T.accent }}>~10,75% AA</td>
                    <td style={{ padding: 10, display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button onClick={() => { setEditAssetId(a.id); setAName(a.name); setAType(a.type); setAAmount(a.amount); }} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer" }}><Edit2 size={13} /></button>
                      <button onClick={() => setAssets(assets.filter(item => item.id !== a.id))} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Card>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>Metas Financeiras</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id} style={{ border: `1.5px solid ${T.border}`, padding: 16, borderRadius: 18, background: T.bg }}>
                <div style={{ display: "flex", justify: "space-between", items: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{g.name}</span>
                  <button onClick={() => setGoals(goals.filter(item => item.id !== g.id))} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><X size={12} /></button>
                </div>
                <div style={{ width: "100%", height: 6, background: "rgba(0,0,0,0.05)", borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: g.color }} />
                </div>
                <div style={{ display: "flex", justify: "space-between", fontSize: 11, color: T.muted }}>
                  <span>{pct}% Concluído</span>
                  <span style={{ fontWeight: 700, color: T.text }}>{fmt(g.current)} / {fmt(g.target)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function AITab({ transactions, goals, invoices, accent }) {
  const T = makeTheme(accent);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Olá! Sou o seu Assistente IA. Analisei as suas finanças. Como posso ajudar você hoje?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      const balance = transactions.reduce((a, t) => a + t.amount, 0);
      const pendingInvoices = invoices.filter(i => i.status !== "Pago").reduce((a, i) => a + i.amount, 0);
      let reply = "Percebi que o seu fluxo de transações está regular. Recomendo manter uma reserva equivalente a 6 meses das suas despesas.";
      if (balance < pendingInvoices) {
        reply = `Atenção: O seu saldo atual total (${fmt(balance)}) é menor do que a soma das suas faturas pendentes (${fmt(pendingInvoices)}). Sugiro adiar gastos supérfluos.`;
      } else if (goals.length > 0) {
        reply = `O seu saldo está saudável! Que tal destinar uma parte para a meta '${goals[0].name}'? Faltam alguns aportes para concluir!`;
      }
      setChatMessages(prev => [...prev, { sender: "bot", text: reply }]);
    }, 750);
  };

  return (
    <Card style={{ maxWidth: 700, margin: "0 auto" }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 14 }}>Central de Ajuda Inteligente (IA)</p>
      <div style={{ height: 320, background: T.bg, borderRadius: 16, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, border: `1.5px solid ${T.border}` }}>
        {chatMessages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ background: msg.sender === "user" ? T.accent : T.card, color: msg.sender === "user" ? "#fff" : T.text, padding: "10px 14px", borderRadius: 14, fontSize: 13, maxWidth: "80%", boxShadow: "0 2px 6px rgba(0,0,0,0.02)", fontWeight: 500 }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Diga: Como está o meu saldo?"
          style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, outline: "none", background: T.bg, color: T.text }} />
        <Btn onClick={handleSendMessage} accent={T.accent}><Send size={14} /></Btn>
      </form>
    </Card>
  );
}

function SettingsTab({ profile, profiles, setProfiles, setCurrentProfile, onLogout, accent, setAccent, font, setFont, allData }) {
  const T = makeTheme(accent);
  const [newProfileName, setNewProfileName] = useState("");

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    const p = { id: Date.now(), name: newProfileName.trim(), password: "1234", avatar: null };
    setProfiles([...profiles, p]);
    setNewProfileName("");
  };

  const switchProfile = (pid) => {
    const p = profiles.find(item => item.id === pid);
    if (p) setCurrentProfile(p);
  };

  const downloadData = (format) => {
    let dataStr = "";
    let filename = `backup_${profile?.name || "user"}`;
    if (format === "json") {
      dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
      filename += ".json";
    } else {
      const csvRows = ["Modulo,Nome/Descricao,Valor/Quantia,Status/Categoria"];
      allData.transactions.forEach(t => csvRows.push(`Transacao,${t.name},${t.amount},${t.category}`));
      allData.invoices.forEach(i => csvRows.push(`Fatura,${i.name},${i.amount},${i.status}`));
      dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
      filename += ".csv";
    }
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>Visual & Estilo</p>
        <FSelect label="Tipografia Global" value={font} onChange={e => setFont(e.target.value)} options={["Inter", "Roboto", "Montserrat"]} />
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>Paleta de Cores (Tema Principal)</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["#7BCB68", "#60a5fa", "#f59e0b", "#ef4444", "#a855f7"].map(c => (
              <button key={c} onClick={() => setAccent(c)} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: accent === c ? "3px solid #1D1D1D" : "2px solid transparent", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Exportar Backup de Dados</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" small accent={T.accent} onClick={() => downloadData("json")}><Download size={12} /> Salvar em JSON</Btn>
            <Btn variant="outline" small accent={T.accent} onClick={() => downloadData("excel")}><Download size={12} /> Planilha Excel/CSV</Btn>
          </div>
        </div>
      </Card>

      <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>Gerenciar Perfis Multi-Usuário</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {profiles.map(p => (
            <div key={p.id} onClick={() => switchProfile(p.id)} style={{ display: "flex", items: "center", gap: 10, padding: 10, borderRadius: 12, background: profile?.id === p.id ? T.bg : "transparent", border: `1.5px solid ${profile?.id === p.id ? T.accent : "transparent"}`, cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, display: "flex", items: "center", justify: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{p.name[0].toUpperCase()}</div>
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{p.name} {profile?.id === p.id && "• Ativo"}</span>
              {profiles.length > 1 && p.id !== profile?.id && (
                <button onClick={(e) => { e.stopPropagation(); setProfiles(profiles.filter(prof => prof.id !== p.id)); }} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={13} /></button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, pt: 4 }}>
          <input value={newProfileName} onChange={e => setNewProfileName(e.target.value)} placeholder="Nome do perfil" style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 12, background: T.bg, color: T.text, outline: "none" }} />
          <Btn small accent={T.accent} onClick={handleCreateProfile}>Criar</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── Core App Component ───────────────────────────────────────────────────────
export default App;
function App() {
  const [profiles, setProfiles] = useState(() => LS.get("fin_global_profiles", [{ id: 1, name: "Admin", password: "1234", avatar: null }]));
  const [currentProfile, setCurrentProfile] = useState(() => LS.get("fin_global_active_profile", null));

  const pid = currentProfile?.id || 0;
  const [accent, setAccent] = useState(() => LS.get(pkey(pid, "accent"), "#7BCB68"));
  const [font, setFont] = useState(() => LS.get(pkey(pid, "font"), "Inter"));
  const [active, setActive] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [assets, setAssets] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => { LS.set("fin_global_profiles", profiles); }, [profiles]);
  useEffect(() => { LS.set("fin_global_active_profile", currentProfile); }, [currentProfile]);

  useEffect(() => {
    if (!currentProfile) return;
    const id = currentProfile.id;
    setTransactions(LS.get(pkey(id, "tx"), SEED_TX));
    setCards(LS.get(pkey(id, "cards"), SEED_CARDS));
    setFixed(LS.get(pkey(id, "fixed"), SEED_FIXED));
    setInvoices(LS.get(pkey(id, "invoices"), SEED_INVOICES));
    setAssets(LS.get(pkey(id, "assets"), SEED_ASSETS));
    setGoals(LS.get(pkey(id, "goals"), SEED_GOALS));
    setAccent(LS.get(pkey(id, "accent"), "#7BCB68"));
    setFont(LS.get(pkey(id, "font"), "Inter"));
  }, [currentProfile]);

  useEffect(() => { if(pid) LS.set(pkey(pid, "tx"), transactions); }, [transactions, pid]);
  useEffect(() => { if(pid) LS.set(pkey(pid, "cards"), cards); }, [cards, pid]);
  useEffect(() => { if(pid) LS.set(pkey(pid, "fixed"), fixed); }, [fixed, pid]);
  useEffect(() => { if(pid) LS.set(pkey(pid, "invoices"), invoices); }, [invoices, pid]);
  useEffect(() => { if(pid) LS.set(pkey(pid, "assets"), assets); }, [assets, pid]);
  useEffect(() => { if(pid) LS.set(pkey(pid, "goals"), goals); }, [goals, pid]);
  useEffect(() => { if(pid) LS.set(pkey(pid, "accent"), accent); }, [accent, pid]);
  useEffect(() => { if(pid) LS.set(pkey(pid, "font"), font); }, [font, pid]);

  const handleLogin = (prof) => setCurrentProfile(prof);
  const handleLogout = () => setCurrentProfile(null);
  const handleCreateProfile = (p) => setProfiles([...profiles, p]);

  const allData = { transactions, cards, fixed, invoices, assets, goals };
  const T = makeTheme(accent);

  if (!currentProfile) {
    return <LoginScreen profiles={profiles} onLogin={handleLogin} onCreateProfile={handleCreateProfile} accent={accent} />;
  }

  const tabTitles = { dashboard: "Dashboard Overview", transactions: "Transações", cards: "Gerenciar Cartões", fixed: "Despesas Fixas", invoices: "Faturas Próximas", investments: "Investimentos & Metas", ai: "Assistente de IA", settings: "Configurações do Sistema" };

  return (
    <div style={{ display: "flex", background: T.bg, minHeight: "100vh", fontFamily: `${font}, sans-serif`, color: T.text }}>
      <Sidebar active={active} setActive={setActive} profile={currentProfile} onLogout={handleLogout} accent={accent} allProfiles={profiles} onSwitchProfile={setCurrentProfile} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <Header profile={currentProfile} onLogout={handleLogout} invoices={invoices} fixedExpenses={fixed} accent={accent} searchQuery={searchQuery} setSearchQuery={setSearchQuery} allProfiles={profiles} onSwitchProfile={setCurrentProfile} />
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>{tabTitles[active]}</h2>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              {active === "dashboard" && <DashboardTab transactions={transactions} cards={cards} accent={accent} searchQuery={searchQuery} />}
              {active === "transactions" && <TransactionsTab transactions={transactions} setTransactions={setTransactions} cards={cards} accent={accent} />}
              {active === "cards" && <CardsTab cards={cards} setCards={setCards} accent={accent} />}
              {active === "fixed" && <FixedTab fixed={fixed} setFixed={setFixed} accent={accent} />}
              {active === "invoices" && <InvoicesTab invoices={invoices} setInvoices={setInvoices} accent={accent} searchQuery={searchQuery} />}
              {active === "investments" && <InvestmentsTab goals={goals} setGoals={setGoals} assets={assets} setAssets={setAssets} accent={accent} searchQuery={searchQuery} />}
              {active === "ai" && <AITab transactions={transactions} goals={goals} invoices={invoices} accent={accent} />}
              {active === "settings" && <SettingsTab profile={currentProfile} profiles={profiles} setProfiles={setProfiles} setCurrentProfile={setCurrentProfile} onLogout={handleLogout} accent={accent} setAccent={setAccent} font={font} setFont={setFont} allData={allData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
