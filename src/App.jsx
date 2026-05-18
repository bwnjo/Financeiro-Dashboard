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
            <p style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>{fmt(income)}</p>
            <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 4 }}>
              <div style={{ width: income + expenses > 0 ? `${(income / (income + expenses)) * 100}%` : "0%", height: "100%", background: "#fff", borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ background: T.card, borderRadius: 24, padding: "20px 22px", boxShadow: T.shadow, flex: 1, border: `1.5px solid ${T.border}` }}>
            <p style={{ color: T.muted, fontSize: 12, marginBottom: 4 }}>Saídas</p>
            <p style={{ color: T.danger, fontSize: 24, fontWeight: 800, margin: 0 }}>-{fmt(expenses)}</p>
            <div style={{ marginTop: 10, height: 4, background: T.bg, borderRadius: 4 }}>
              <div style={{ width: income + expenses > 0 ? `${(expenses / (income + expenses)) * 100}%` : "0%", height: "100%", background: T.danger, borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <p style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 8 }}>Resumo de Gastos</p>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="99%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: T.muted, fontSize: 13 }}>Nenhuma despesa registrada</p>
            </div>
          )}
          {donutData.slice(0, 4).map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                <span style={{ fontSize: 12, color: T.muted }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{fmt(d.value)}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "12px", borderRadius: 14, background: T.bg }}>
            <p style={{ fontSize: 11, color: T.muted, margin: "0 0 2px" }}>Total de Entradas</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.accent, margin: 0 }}>{fmt(income)}</p>
          </div>
        </Card>

        <Card>
          <p style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 8 }}>Fluxo de Caixa</p>
          <ResponsiveContainer width="99%" height={200}>
            <BarChart data={weekData} barSize={11} barGap={2}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: T.muted }} />
              <YAxis hide />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Bar dataKey="entradas" fill={T.accent} radius={[5, 5, 0, 0]} />
              <Bar dataKey="saidas" fill="#fca5a5" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 14, padding: "12px", borderRadius: 14, background: T.bg }}>
            <p style={{ fontSize: 11, color: T.muted, margin: "0 0 2px" }}>Total de Saídas</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.danger, margin: 0 }}>-{fmt(expenses)}</p>
          </div>
        </Card>
      </div>

      <Card>
        <p style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 16 }}>Transações Recentes {searchQuery && `— "${searchQuery}"`}</p>
        {recent.length === 0 ? <p style={{ color: T.muted, fontSize: 13 }}>Nenhuma transação encontrada</p> : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 16px", marginBottom: 6 }}>
              {["TRANSAÇÃO", "VALOR", "CATEGORIA"].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 800, color: T.muted }}>{h}</span>)}
            </div>
            {recent.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ display: "contents" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 16px", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{t.amount > 0 ? "💰" : "🛒"}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{fmtDateTime(t.date)} · {t.bank}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: t.amount > 0 ? T.accent : T.danger }}>{t.amount > 0 ? "+" : ""}{fmt(t.amount)}</span>
                  <Badge>{t.category}</Badge>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </Card>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ transactions, setTransactions, cards, accent }) {
  const T = makeTheme(accent);
  const emptyForm = { name: "", amount: "", category: "Compras", type: "expense", date: new Date().toISOString().slice(0, 10), payment: "Pix", bank: "" };
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ month: "", bank: "", category: "" });
  const banks = [...new Set(cards.map(c => c.bank).concat(transactions.map(t => t.bank).filter(Boolean)))];
  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse();

  const add = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    const tx = { id: Date.now(), name: form.name, amount: form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)), category: form.category, date: new Date(form.date).toISOString(), payment: form.payment, bank: form.bank };
    setTransactions([tx, ...transactions]);
    setForm(emptyForm);
  };

  const remove = (id) => setTransactions(transactions.filter(t => t.id !== id));

  const filtered = transactions.filter(t => {
    if (filters.month && t.date.slice(0, 7) !== filters.month) return false;
    if (filters.bank && t.bank !== filters.bank) return false;
    if (filters.category && t.category !== filters.category) return false;
    return true;
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      <Card style={{ height: "fit-content" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>Nova Transação</h3>
        <form onSubmit={add}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["expense", "income"].map(tp => (
              <button type="button" key={tp} onClick={() => setForm(f => ({ ...f, type: tp, category: tp === "income" ? "Receitas" : "Compras" }))}
                style={{ flex: 1, padding: "9px", borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: form.type === tp ? (tp === "expense" ? T.danger : T.accent) : T.bg, color: form.type === tp ? "#fff" : T.muted }}>
                {tp === "expense" ? "Despesa" : "Receita"}
              </button>
            ))}
          </div>
          <FInput label="Descrição" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Supermercado" />
          <FInput label="Valor (R$)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} type="number" placeholder="0,00" />
          <FInput label="Data" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} type="date" />
          <FSelect label="Categoria" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={CATS} />
          <FSelect label="Meio de Pagamento" value={form.payment} onChange={e => setForm(f => ({ ...f, payment: e.target.value }))} options={PAYMENTS} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>Banco</label>
            <input list="blist" value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} placeholder="Ex: Nubank"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
            <datalist id="blist">{banks.map(b => <option key={b} value={b} />)}</datalist>
          </div>
          <Btn full accent={T.accent} onClick={add}><Plus size={14} />Adicionar</Btn>
        </form>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>Histórico ({filtered.length})</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Todos os meses", key: "month", opts: months }, { label: "Todos os bancos", key: "bank", opts: banks }, { label: "Todas categorias", key: "category", opts: CATS }].map(f => (
              <select key={f.key} value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ padding: "7px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 12, background: T.bg, color: T.text, outline: "none" }}>
                <option value="">{f.label}</option>
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>
        {filtered.length === 0 && <p style={{ color: T.muted, textAlign: "center", padding: "28px 0", fontSize: 13 }}>Nenhuma transação encontrada</p>}
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{t.amount > 0 ? "💰" : "🛒"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</p>
              <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{fmtDateTime(t.date)} · {t.bank} · {t.payment}</p>
            </div>
            <Badge>{t.category}</Badge>
            <span style={{ fontWeight: 700, fontSize: 14, color: t.amount > 0 ? T.accent : T.danger, flexShrink: 0 }}>{t.amount > 0 ? "+" : ""}{fmt(t.amount)}</span>
            <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><Trash2 size={14} /></button>
          </motion.div>
        ))}
      </Card>
    </div>
  );
}

// ─── Cards Tab ─────────────────────────────────────────────────────────────────
function CardsTab({ cards, setCards, accent }) {
  const T = makeTheme(accent);
  const emptyCard = { bank: "", number: "", limit: "", balance: "", due: "", color: accent };
  const [form, setForm] = useState(emptyCard);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const save = (e) => {
    e.preventDefault();
    if (!form.bank || !form.number) return;
    const card = { ...form, limit: parseFloat(form.limit) || 0, balance: parseFloat(form.balance) || 0 };
    const updated = editId ? cards.map(c => c.id === editId ? { ...c, ...card } : c) : [...cards, { id: Date.now(), ...card }];
    setCards(updated); setForm(emptyCard); setShowForm(false); setEditId(null);
  };

  const startEdit = (c) => { setForm({ bank: c.bank, number: c.number, limit: String(c.limit), balance: String(c.balance), due: c.due, color: c.color }); setEditId(c.id); setShowForm(true); };
  const remove = (id) => setCards(cards.filter(c => c.id !== id));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 20, color: T.text, margin: 0 }}>Meus Cartões</h2>
        <Btn accent={accent} onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyCard); }}><Plus size={14} />Novo Cartão</Btn>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 20 }}>
            <Card>
              <h4 style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>{editId ? "Editar Cartão" : "Adicionar Cartão"}</h4>
              <form onSubmit={save}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[["Banco", "bank", "Ex: Nubank"], ["Número", "number", "0000 0000 0000 0000"], ["Validade", "due", "MM/AA"], ["Limite (R$)", "limit", "10000"], ["Saldo (R$)", "balance", "0"]].map(([l, k, p]) => (
                    <div key={k}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>{l}</label>
                      <input value={form[k]} onChange={e => setForm(p2 => ({ ...p2, [k]: e.target.value }))} placeholder={p}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>Cor</label>
                    <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                      style={{ width: "100%", height: 42, borderRadius: 12, border: `1.5px solid ${T.border}`, cursor: "pointer" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Btn accent={accent} onClick={save}><Save size={14} />Salvar</Btn>
                  <Btn variant="ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyCard); }}>Cancelar</Btn>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {cards.map(card => (
          <motion.div key={card.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card>
              <PhysicalCard card={card} />
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.muted }}>Uso do limite</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{card.limit > 0 ? Math.round((card.balance / card.limit) * 100) : 0}%</span>
                </div>
                <div style={{ height: 6, background: T.bg, borderRadius: 3 }}>
                  <div style={{ width: `${card.limit > 0 ? Math.min((card.balance / card.limit) * 100, 100) : 0}%`, height: "100%", background: card.color, borderRadius: 3, transition: "width .4s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                  <div><p style={{ fontSize: 10, color: T.muted, margin: 0 }}>Saldo</p><p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>{fmt(card.balance)}</p></div>
                  <div><p style={{ fontSize: 10, color: T.muted, margin: 0 }}>Limite</p><p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>{fmt(card.limit)}</p></div>
                  <div style={{ display: "flex", gap: 8, alignSelf: "flex-end" }}>
                    <button onClick={() => startEdit(card)} style={{ background: T.bg, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: T.muted }}><Edit2 size={13} /></button>
                    <button onClick={() => remove(card.id)} style={{ background: "#FEE2E2", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: T.danger }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Fixed Expenses Tab ───────────────────────────────────────────────────────
function FixedTab({ fixed, setFixed, accent }) {
  const T = makeTheme(accent);
  const [form, setForm] = useState({ name: "", amount: "", hasInst: false, current: "", total: "" });
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const add = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    const item = { id: Date.now(), name: form.name, amount: parseFloat(form.amount), status: "Pendente", installment: form.hasInst ? { current: parseInt(form.current) || 1, total: parseInt(form.total) || 1 } : null, month: filterMonth };
    setFixed([...fixed, item]);
    setForm({ name: "", amount: "", hasInst: false, current: "", total: "" });
  };

  const toggle = (id) => setFixed(fixed.map(f => f.id === id ? { ...f, status: f.status === "Pago" ? "Pendente" : "Pago" } : f));
  const remove = (id) => setFixed(fixed.filter(f => f.id !== id));

  const months = [...new Set(fixed.map(f => f.month || "").filter(Boolean))].sort().reverse();
  if (!months.includes(filterMonth)) months.unshift(filterMonth);
  const filteredFixed = fixed.filter(f => (f.month || "").startsWith(filterMonth));
  const totalF = filteredFixed.reduce((a, f) => a + f.amount, 0);
  const paidF = filteredFixed.filter(f => f.status === "Pago").reduce((a, f) => a + f.amount, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
      <div>
        <Card style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 14 }}>Nova Despesa Fixa</h4>
          <form onSubmit={add}>
            <FInput label="Nome" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Aluguel" />
            <FInput label="Valor (R$)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" placeholder="0" />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer", fontSize: 13, color: T.text }}>
              <input type="checkbox" checked={form.hasInst} onChange={e => setForm(p => ({ ...p, hasInst: e.target.checked }))} />Parcelado?
            </label>
            {form.hasInst && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <FInput label="Parcela atual" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))} type="number" />
                <FInput label="Total" value={form.total} onChange={e => setForm(p => ({ ...p, total: e.target.value }))} type="number" />
              </div>
            )}
            <Btn full accent={accent} onClick={add}><Plus size={14} />Adicionar</Btn>
          </form>
        </Card>
        <Card>
          <p style={{ fontSize: 12, color: T.muted, margin: "0 0 4px" }}>Total despesas fixas</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: T.danger, margin: "0 0 10px" }}>-{fmt(totalF)}</p>
          <div style={{ height: 6, background: T.bg, borderRadius: 3, marginBottom: 6 }}>
            <div style={{ width: totalF > 0 ? `${(paidF / totalF) * 100}%` : "0%", height: "100%", background: T.accent, borderRadius: 3, transition: "width .4s" }} />
          </div>
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{fmt(paidF)} pago de {fmt(totalF)}</p>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>Despesas & Dívidas</h3>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 12, background: T.bg, color: T.text, outline: "none" }}>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {filteredFixed.length === 0 && <p style={{ color: T.muted, textAlign: "center", padding: "28px 0", fontSize: 13 }}>Nenhuma despesa neste mês</p>}
        {filteredFixed.map(item => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{item.name}</p>
                {item.installment && <Badge>{item.installment.current}/{item.installment.total}x</Badge>}
              </div>
              <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>{fmt(item.amount)}/mês</p>
            </div>
            <button onClick={() => toggle(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: item.status === "Pago" ? "#dcfce7" : "#fef3c7", color: item.status === "Pago" ? "#16a34a" : "#d97706" }}>
              {item.status === "Pago" ? <CheckCircle2 size={13} /> : <Clock size={13} />}{item.status}
            </button>
            <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><Trash2 size={14} /></button>
          </motion.div>
        ))}
      </Card>
    </div>
  );
}

// ─── Invoices Tab ─────────────────────────────────────────────────────────────
function InvoicesTab({ invoices, setInvoices, accent, searchQuery }) {
  const T = makeTheme(accent);
  const empty = { name: "", amount: "", dueDate: "", status: "Pendente", recurring: false };
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [calMsg, setCalMsg] = useState("");

  const add = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.dueDate) return;
    setInvoices([...invoices, { id: Date.now(), ...form, amount: parseFloat(form.amount) }]);
    setForm(empty); setShowForm(false);
  };

  const toggle = (id) => setInvoices(invoices.map(i => i.id === id ? { ...i, status: i.status === "Pago" ? "Pendente" : "Pago" } : i));
  const remove = (id) => setInvoices(invoices.filter(i => i.id !== id));

  const connectCalendar = () => {
    const pending = invoices.filter(i => i.status !== "Pago");
    setCalMsg(pending.length ? `✅ Simulação: ${pending.length} lembrete(s) criados no Google Agenda! Você será notificado 1 dia antes do vencimento.` : "Todas as faturas já estão pagas!");
    setTimeout(() => setCalMsg(""), 4000);
  };

  const filtered = searchQuery ? invoices.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())) : invoices;
  const pendingTotal = invoices.filter(i => i.status !== "Pago").reduce((a, i) => a + i.amount, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontWeight: 800, fontSize: 20, color: T.text, margin: 0 }}>Faturas</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" accent={accent} onClick={connectCalendar}><Calendar size={14} />Conectar Google Agenda</Btn>
          <Btn accent={accent} onClick={() => setShowForm(!showForm)}><Plus size={14} />Nova Fatura</Btn>
        </div>
      </div>
      {calMsg && <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 14, padding: "12px 18px", marginBottom: 16, fontSize: 13, color: "#16a34a", fontWeight: 600 }}>{calMsg}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[{ label: "Total Pendente", value: fmt(pendingTotal), color: T.danger }, { label: "Vence em 7 dias", value: invoices.filter(i => i.status !== "Pago" && daysUntil(i.dueDate) <= 7 && daysUntil(i.dueDate) >= 0).length, color: T.warn }, { label: "Recorrentes", value: invoices.filter(i => i.recurring).length, color: T.accent }].map((s, i) => (
          <Card key={i} style={{ padding: "18px 22px" }}>
            <p style={{ fontSize: 12, color: T.muted, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
          </Card>
        ))}
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 20 }}>
            <Card>
              <h4 style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Adicionar Fatura</h4>
              <form onSubmit={add}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <FInput label="Nome" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Netflix" />
                  <FInput label="Valor (R$)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" placeholder="0,00" />
                  <FInput label="Vencimento" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} type="date" />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: T.text, margin: "8px 0 14px" }}>
                  <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} />Recorrente
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn accent={accent} onClick={add}><Save size={14} />Salvar</Btn>
                  <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Card>
        {filtered.length === 0 && <p style={{ color: T.muted, textAlign: "center", padding: "28px 0", fontSize: 13 }}>Nenhuma fatura cadastrada</p>}
        {filtered.map((inv, i) => {
          const days = daysUntil(inv.dueDate);
          const overdue = days < 0 && inv.status !== "Pago";
          return (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: overdue ? "#FEE2E2" : T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} color={overdue ? T.danger : T.accent} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{inv.name}</p>
                  {inv.recurring && <Badge color={T.accent} bg="#f0fdf4">Recorrente</Badge>}
                </div>
                <p style={{ fontSize: 12, color: overdue ? T.danger : T.muted, margin: 0, fontWeight: overdue ? 600 : 400 }}>
                  {inv.status !== "Pago" ? (overdue ? `Vencida há ${Math.abs(days)} dia(s)` : days === 0 ? "Vence hoje!" : `Vence em ${days} dia(s)`) : `Venceu em ${fmtDate(inv.dueDate)}`}
                </p>
              </div>
              <p style={{ fontWeight: 800, fontSize: 15, color: T.text, margin: 0 }}>{fmt(inv.amount)}</p>
              <button onClick={() => toggle(inv.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: inv.status === "Pago" ? "#dcfce7" : "#fef3c7", color: inv.status === "Pago" ? "#16a34a" : "#d97706" }}>
                {inv.status === "Pago" ? <CheckCircle2 size={13} /> : <Clock size={13} />}{inv.status}
              </button>
              <button onClick={() => remove(inv.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><Trash2 size={14} /></button>
            </motion.div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── Investments Tab ──────────────────────────────────────────────────────────
function InvestmentsTab({ goals, setGoals, assets, setAssets, accent, searchQuery }) {
  const T = makeTheme(accent);
  const [cdiRate, setCdiRate] = useState(10.5);
  const emptyAsset = { name: "", type: "Renda Fixa", amount: "", cdiMult: "1.0", manualReturn: "", purchaseDate: "" };
  const [assetForm, setAssetForm] = useState(emptyAsset);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editAssetId, setEditAssetId] = useState(null);
  const emptyGoal = { name: "", target: "", current: "", color: accent, deadline: "" };
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editGoalId, setEditGoalId] = useState(null);
  const [depositId, setDepositId] = useState(null);
  const [depositAmt, setDepositAmt] = useState("");

  const calcReturn = (a) => {
    if (a.type === "Renda Fixa") return (cdiRate / 100) * parseFloat(a.cdiMult || 1) * parseFloat(a.amount || 0);
    return (parseFloat(a.manualReturn || 0) / 100) * parseFloat(a.amount || 0);
  };

  const saveAsset = (e) => {
    e.preventDefault();
    const asset = { ...assetForm, amount: parseFloat(assetForm.amount) || 0, cdiMult: parseFloat(assetForm.cdiMult) || 1, manualReturn: parseFloat(assetForm.manualReturn) || 0 };
    const updated = editAssetId ? assets.map(a => a.id === editAssetId ? { ...a, ...asset } : a) : [...assets, { id: Date.now(), ...asset }];
    setAssets(updated); setAssetForm(emptyAsset); setShowAssetForm(false); setEditAssetId(null);
  };

  const saveGoal = (e) => {
    e.preventDefault();
    const goal = { ...goalForm, target: parseFloat(goalForm.target) || 0, current: parseFloat(goalForm.current) || 0 };
    const updated = editGoalId ? goals.map(g => g.id === editGoalId ? { ...g, ...goal } : g) : [...goals, { id: Date.now(), ...goal }];
    setGoals(updated); setGoalForm(emptyGoal); setShowGoalForm(false); setEditGoalId(null);
  };

  const deposit = (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmt);
    if (!amt || !depositId) return;
    setGoals(goals.map(g => g.id === depositId ? { ...g, current: Math.min(g.current + amt, g.target) } : g));
    setDepositId(null); setDepositAmt("");
  };

  const totalInvested = assets.reduce((a, i) => a + parseFloat(i.amount || 0), 0);
  const totalMonthly = assets.reduce((a, i) => a + calcReturn(i) / 12, 0);
  const filteredGoals = searchQuery ? goals.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())) : goals;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: T.text, margin: 0 }}>Portfólio de Investimentos</p>
            <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>Total: <b style={{ color: T.accent }}>{fmt(totalInvested)}</b> · Rendimento mensal: <b style={{ color: "#60a5fa" }}>{fmt(totalMonthly)}</b></p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.bg, padding: "7px 14px", borderRadius: 12 }}>
              <Percent size={13} color={T.muted} />
              <span style={{ fontSize: 12, color: T.muted }}>CDI</span>
              <input type="number" value={cdiRate} onChange={e => setCdiRate(parseFloat(e.target.value) || 10.5)} step="0.1" min="0" max="30"
                style={{ width: 54, padding: "4px 8px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, background: T.card, color: T.text, outline: "none" }} />
              <span style={{ fontSize: 12, color: T.muted }}>% a.a.</span>
            </div>
            <Btn accent={accent} small onClick={() => { setShowAssetForm(!showAssetForm); setEditAssetId(null); setAssetForm(emptyAsset); }}><Plus size={13} />Ativo</Btn>
          </div>
        </div>
        <AnimatePresence>
          {showAssetForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 14 }}>
              <form onSubmit={saveAsset} style={{ background: T.bg, borderRadius: 16, padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
                  <FInput label="Nome" value={assetForm.name} onChange={e => setAssetForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Tesouro Selic" />
                  <FSelect label="Tipo" value={assetForm.type} onChange={e => setAssetForm(p => ({ ...p, type: e.target.value }))} options={ASSET_TYPES} />
                  <FInput label="Valor (R$)" value={assetForm.amount} onChange={e => setAssetForm(p => ({ ...p, amount: e.target.value }))} type="number" />
                  {assetForm.type === "Renda Fixa"
                    ? <FInput label="% CDI" value={assetForm.cdiMult} onChange={e => setAssetForm(p => ({ ...p, cdiMult: e.target.value }))} type="number" />
                    : <FInput label="Retorno %" value={assetForm.manualReturn} onChange={e => setAssetForm(p => ({ ...p, manualReturn: e.target.value }))} type="number" />
                  }
                  <FInput label="Compra" value={assetForm.purchaseDate} onChange={e => setAssetForm(p => ({ ...p, purchaseDate: e.target.value }))} type="date" />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <Btn accent={accent} small onClick={saveAsset}><Save size={13} />Salvar</Btn>
                  <Btn variant="ghost" small onClick={() => { setShowAssetForm(false); setEditAssetId(null); }}>Cancelar</Btn>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        {assets.length === 0 && <p style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Nenhum ativo cadastrado</p>}
        {assets.map((a, i) => {
          const ret = calcReturn(a); const retPct = parseFloat(a.amount) > 0 ? (ret / parseFloat(a.amount)) * 100 : 0;
          return (
            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "0 12px", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>{a.name}</p>
              <Badge>{a.type}</Badge>
              <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>{fmt(a.amount)}</p>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: retPct >= 0 ? T.accent : T.danger, margin: 0 }}>{retPct >= 0 ? "+" : ""}{retPct.toFixed(2)}% a.a.</p>
                <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{fmt(ret / 12)}/mês</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setAssetForm({ name: a.name, type: a.type, amount: String(a.amount), cdiMult: String(a.cdiMult || 1), manualReturn: String(a.manualReturn || 0), purchaseDate: a.purchaseDate || "" }); setEditAssetId(a.id); setShowAssetForm(true); }} style={{ background: T.bg, border: "none", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: T.muted }}><Edit2 size={12} /></button>
                <button onClick={() => setAssets(assets.filter(x => x.id !== a.id))} style={{ background: "#FEE2E2", border: "none", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: T.danger }}><Trash2 size={12} /></button>
              </div>
            </motion.div>
          );
        })}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>Metas Financeiras</h3>
          <Btn accent={accent} small onClick={() => { setShowGoalForm(!showGoalForm); setEditGoalId(null); setGoalForm(emptyGoal); }}><Plus size={13} />Meta</Btn>
        </div>
        <AnimatePresence>
          {showGoalForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 14 }}>
              <form onSubmit={saveGoal} style={{ background: T.bg, borderRadius: 16, padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", gap: 10 }}>
                  <FInput label="Nome" value={goalForm.name} onChange={e => setGoalForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Reserva" />
                  <FInput label="Objetivo (R$)" value={goalForm.target} onChange={e => setGoalForm(p => ({ ...p, target: e.target.value }))} type="number" />
                  <FInput label="Atual (R$)" value={goalForm.current} onChange={e => setGoalForm(p => ({ ...p, current: e.target.value }))} type="number" />
                  <FInput label="Prazo" value={goalForm.deadline} onChange={e => setGoalForm(p => ({ ...p, deadline: e.target.value }))} type="date" />
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>Cor</label><input type="color" value={goalForm.color} onChange={e => setGoalForm(p => ({ ...p, color: e.target.value }))} style={{ width: "100%", height: 42, borderRadius: 10, border: `1.5px solid ${T.border}` }} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <Btn accent={accent} small onClick={saveGoal}><Save size={13} />Salvar</Btn>
                  <Btn variant="ghost" small onClick={() => { setShowGoalForm(false); setEditGoalId(null); }}>Cancelar</Btn>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {filteredGoals.map(g => (
            <motion.div key={g.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: T.bg, borderRadius: 18, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: g.color }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{g.name}</span>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => { setGoalForm({ name: g.name, target: String(g.target), current: String(g.current), color: g.color, deadline: g.deadline || "" }); setEditGoalId(g.id); setShowGoalForm(true); }} style={{ background: T.card, border: "none", borderRadius: 7, padding: "4px 7px", cursor: "pointer", color: T.muted }}><Edit2 size={12} /></button>
                  <button onClick={() => setGoals(goals.filter(x => x.id !== g.id))} style={{ background: "#FEE2E2", border: "none", borderRadius: 7, padding: "4px 7px", cursor: "pointer", color: T.danger }}><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: T.muted }}>{fmt(g.current)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{fmt(g.target)}</span>
              </div>
              <div style={{ height: 8, background: T.card, borderRadius: 4, marginBottom: 6 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", background: g.color, borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: T.muted }}>{g.target > 0 ? Math.round((g.current / g.target) * 100) : 0}%{g.deadline && ` · ${fmtDate(g.deadline)}`}</span>
                {depositId === g.id ? (
                  <form onSubmit={deposit} style={{ display: "flex", gap: 6 }}>
                    <input autoFocus value={depositAmt} onChange={e => setDepositAmt(e.target.value)} type="number" placeholder="R$"
                      style={{ width: 72, padding: "4px 8px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 11, background: T.card, color: T.text, outline: "none" }} />
                    <Btn accent={accent} small onClick={deposit}><Save size={11} /></Btn>
                    <Btn variant="ghost" small onClick={() => setDepositId(null)}><X size={11} /></Btn>
                  </form>
                ) : (
                  <button onClick={() => { setDepositId(g.id); setDepositAmt(""); }} style={{ fontSize: 11, fontWeight: 700, color: T.accent, background: "none", border: "none", cursor: "pointer" }}>+Depositar</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── AI Chat Tab ──────────────────────────────────────────────────────────────
function AITab({ transactions, goals, invoices, accent }) {
  const T = makeTheme(accent);
  const balance = transactions.reduce((a, t) => a + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
  const catMap = {};
  transactions.filter(t => t.amount < 0).forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount); });
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  const pendingInvoices = invoices.filter(i => i.status !== "Pago");

  const SYSTEM = `Você é Fin.AI, assistente financeiro pessoal. Responda em português brasileiro de forma amigável, prática, com emojis.

Dados financeiros do usuário:
- Saldo: ${fmt(balance)}
- Entradas: ${fmt(income)} | Saídas: ${fmt(expenses)}
- Taxa poupança: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%
- Maior gasto: ${topCat ? `${topCat[0]} (${fmt(topCat[1])})` : "N/A"}
- Metas: ${goals.map(g => `${g.name}: ${Math.round((g.current / g.target) * 100)}%`).join(", ") || "Nenhuma"}
- Faturas pendentes: ${pendingInvoices.length} (${fmt(pendingInvoices.reduce((a, i) => a + i.amount, 0))})

Seja conciso (máx 3 parágrafos).`;

  const [messages, setMessages] = useState([{ role: "assistant", text: "Olá! 👋 Sou o **Fin.AI**. Analisei seus dados financeiros e estou pronto para ajudar. Como posso te auxiliar hoje?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (txt) => {
    const text = txt || input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM, messages: history }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", text: data.content?.[0]?.text || "Sem resposta." }]);
    } catch { setMessages(m => [...m, { role: "assistant", text: "Erro de conexão. Tente novamente." }]); }
    setLoading(false);
  };

  const quick = ["Como está minha saúde financeira?", "Onde posso economizar?", "Analise meus gastos", "Como atingir minhas metas mais rápido?"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, height: "calc(100vh - 160px)" }}>
      <Card style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${makeTheme().border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={19} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: T.text, margin: 0 }}>Fin.AI — Assistente Financeiro</p>
            <p style={{ fontSize: 11, color: T.accent, margin: 0 }}>● Online · Análise em tempo real</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? T.accent : makeTheme().bg, color: m.role === "user" ? "#fff" : T.text, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 4, padding: "4px 0" }}>
              {[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.55 }} style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${makeTheme().border}`, display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Pergunte sobre suas finanças..."
            style={{ flex: 1, padding: "11px 16px", borderRadius: 16, border: `1.5px solid ${makeTheme().border}`, fontSize: 13, background: makeTheme().bg, color: T.text, outline: "none" }} />
          <button onClick={() => send()} disabled={loading} style={{ width: 44, height: 44, borderRadius: "50%", background: T.accent, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={17} color="#fff" />
          </button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        <Card>
          <p style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 10 }}>Perguntas Rápidas</p>
          {quick.map((q, i) => (
            <button key={i} onClick={() => send(q)}
              style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 11, border: `1px solid ${makeTheme().border}`, background: makeTheme().bg, color: T.text, fontSize: 12, cursor: "pointer", marginBottom: 7, lineHeight: 1.4 }}>
              {q}
            </button>
          ))}
        </Card>
        <Card>
          <p style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 10 }}>Resumo</p>
          {[{ l: "Saldo", v: fmt(balance), c: balance >= 0 ? T.accent : T.danger }, { l: "Entradas", v: fmt(income), c: T.accent }, { l: "Saídas", v: fmt(expenses), c: T.danger }, { l: "Fat. Pendentes", v: pendingInvoices.length, c: T.warn }].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 3 ? `1px solid ${makeTheme().border}` : "none" }}>
              <span style={{ fontSize: 12, color: T.muted }}>{s.l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.c }}>{s.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ profile, profiles, setProfiles, setCurrentProfile, onLogout, accent, setAccent, font, setFont, allData }) {
  const T = makeTheme(accent);
  const [newName, setNewName] = useState(profile?.name || "");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState({ u: "", p: "" });
  const fileRef = useRef(null);
  const FONTS = ["Inter", "Roboto", "Montserrat", "Nunito", "DM Sans", "Poppins"];
  const PALETTE = ["#7BCB68", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316"];

  const flash = (k, t) => { setMsg(m => ({ ...m, [k]: t })); setTimeout(() => setMsg(m => ({ ...m, [k]: "" })), 2500); };

  const saveUser = () => {
    if (!newName.trim()) return;
    const updated = profiles.map(p => p.id === profile.id ? { ...p, name: newName.trim() } : p);
    setProfiles(updated); setCurrentProfile(updated.find(p => p.id === profile.id)); LS.set("fin_profiles", updated);
    flash("u", "Nome atualizado! ✅");
  };

  const savePass = () => {
    if (oldPass !== profile.password) { flash("p", "Senha atual incorreta."); return; }
    const updated = profiles.map(p => p.id === profile.id ? { ...p, password: newPass } : p);
    setProfiles(updated); setCurrentProfile(updated.find(p => p.id === profile.id)); LS.set("fin_profiles", updated);
    setOldPass(""); setNewPass(""); flash("p", "Senha alterada! ✅");
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updated = profiles.map(p => p.id === profile.id ? { ...p, avatar: ev.target.result } : p);
      setProfiles(updated); setCurrentProfile(updated.find(p => p.id === profile.id)); LS.set("fin_profiles", updated);
    };
    reader.readAsDataURL(file);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "finance-backup.json"; a.click();
  };

  const exportCSV = () => {
    const rows = [["Nome", "Valor", "Categoria", "Data", "Pagamento", "Banco"], ...allData.transactions.map(t => [t.name, t.amount, t.category, fmtDate(t.date), t.payment || "", t.bank || ""])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "transacoes.csv"; a.click();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 18 }}>Perfil</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.accent, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {profile?.avatar ? <img src={profile.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 800, fontSize: 24 }}>{(profile?.name || "U")[0].toUpperCase()}</span>}
              </div>
              <button onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: T.accent, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Camera size={11} color="#fff" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: 0 }}>{profile?.name}</p>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Clique na câmera para alterar a foto</p>
            </div>
          </div>
          <FInput label="Nome de Usuário" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome" />
          <Btn accent={accent} onClick={saveUser}><Save size={14} />Salvar Nome</Btn>
          {msg.u && <p style={{ fontSize: 12, color: msg.u.includes("✅") ? T.accent : T.danger, marginTop: 8 }}>{msg.u}</p>}
        </Card>

        <Card>
          <h4 style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 14 }}>Alterar Senha</h4>
          <FInput label="Senha Atual" value={oldPass} onChange={e => setOldPass(e.target.value)} type="password" />
          <FInput label="Nova Senha" value={newPass} onChange={e => setNewPass(e.target.value)} type="password" />
          <Btn accent={accent} onClick={savePass}><Shield size={14} />Alterar Senha</Btn>
          {msg.p && <p style={{ fontSize: 12, color: msg.p.includes("✅") ? T.accent : T.danger, marginTop: 8 }}>{msg.p}</p>}
        </Card>

        <Card>
          <h4 style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 14 }}>Gerenciar Perfis</h4>
          {profiles.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {p.avatar ? <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{p.name[0].toUpperCase()}</span>}
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.text }}>{p.name}{p.id === profile?.id && " (atual)"}</span>
              {p.id !== profile?.id && (
                <button onClick={() => { const updated = profiles.filter(x => x.id !== p.id); setProfiles(updated); LS.set("fin_profiles", updated); }}
                  style={{ background: "#FEE2E2", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: T.danger }}><Trash2 size={13} /></button>
              )}
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 18 }}>Aparência</h3>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 10 }}>Cor Principal</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {PALETTE.map(c => (
              <button key={c} onClick={() => { setAccent(c); LS.set("fin_accent", c); }}
                style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: accent === c ? `3px solid #1D1D1D` : "3px solid transparent", cursor: "pointer", transition: "all .15s" }} />
            ))}
            <input type="color" value={accent} onChange={e => { setAccent(e.target.value); LS.set("fin_accent", e.target.value); }}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 10 }}>Tipografia</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {FONTS.map(f => (
              <button key={f} onClick={() => { setFont(f); LS.set("fin_font", f); }}
                style={{ padding: "11px", borderRadius: 12, border: `2px solid ${font === f ? accent : T.border}`, background: font === f ? "#f0fdf4" : T.bg, color: font === f ? accent : T.text, fontFamily: f, fontWeight: font === f ? 700 : 500, fontSize: 13, cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>Backup & Exportação</h3>
          {[{ icon: Download, l: "Exportar JSON (completo)", c: accent, fn: exportJSON }, { icon: FileText, l: "Exportar Transações (CSV)", c: "#60a5fa", fn: exportCSV }, { icon: Upload, l: "Sincronizar Google Drive", c: "#4285F4", fn: () => alert("Simulação: Backup sincronizado com Google Drive! ✅") }].map((b, i) => (
            <button key={i} onClick={b.fn}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: T.bg, border: `1.5px solid ${T.border}`, cursor: "pointer", marginBottom: 10, color: T.text, fontWeight: 600, fontSize: 13 }}>
              <b.icon size={18} color={b.c} />{b.l}
            </button>
          ))}
          <p style={{ fontSize: 11, color: T.muted }}>Dados armazenados localmente no navegador.</p>
        </Card>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const DEFAULT_PROFILE = { id: 1, name: "Usuario", password: "1234", avatar: null };

export default function App() {
  const [profiles, setProfiles] = useState(() => LS.get("fin_profiles", [DEFAULT_PROFILE]));
  const [currentProfile, setCurrentProfile] = useState(null);
  const [logged, setLogged] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [accent, setAccent] = useState(() => LS.get("fin_accent", "#7BCB68"));
  const [font, setFont] = useState(() => LS.get("fin_font", "Inter"));
  const [searchQuery, setSearchQuery] = useState("");

  const pid = currentProfile?.id;

  const [transactions, setTxRaw] = useState(SEED_TX);
  const [cards, setCardsRaw] = useState(SEED_CARDS);
  const [fixed, setFixedRaw] = useState(SEED_FIXED);
  const [invoices, setInvoicesRaw] = useState(SEED_INVOICES);
  const [assets, setAssetsRaw] = useState(SEED_ASSETS);
  const [goals, setGoalsRaw] = useState(SEED_GOALS);

  const loadProfile = (profile) => {
    const p = profile.id;
    setTxRaw(LS.get(pkey(p, "tx"), SEED_TX));
    setCardsRaw(LS.get(pkey(p, "cards"), SEED_CARDS));
    setFixedRaw(LS.get(pkey(p, "fixed"), SEED_FIXED));
    setInvoicesRaw(LS.get(pkey(p, "invoices"), SEED_INVOICES));
    setAssetsRaw(LS.get(pkey(p, "assets"), SEED_ASSETS));
    setGoalsRaw(LS.get(pkey(p, "goals"), SEED_GOALS));
  };

  const persist = (key, val) => { if (pid) LS.set(pkey(pid, key), val); };
  const setTransactions = v => { setTxRaw(v); persist("tx", v); };
  const setCards = v => { setCardsRaw(v); persist("cards", v); };
  const setFixed = v => { setFixedRaw(v); persist("fixed", v); };
  const setInvoices = v => { setInvoicesRaw(v); persist("invoices", v); };
  const setAssets = v => { setAssetsRaw(v); persist("assets", v); };
  const setGoals = v => { setGoalsRaw(v); persist("goals", v); };

  const handleLogin = (profile) => { setCurrentProfile(profile); loadProfile(profile); setLogged(true); setActive("dashboard"); };
  const handleCreateProfile = (p) => { const updated = [...profiles, p]; setProfiles(updated); LS.set("fin_profiles", updated); };
  const handleLogout = () => { setLogged(false); setCurrentProfile(null); setActive("dashboard"); setSearchQuery(""); };
  const handleSwitchProfile = (p) => { setCurrentProfile(p); loadProfile(p); setActive("dashboard"); setSearchQuery(""); };
  const handleSetActive = (tab) => { setActive(tab); setSearchQuery(""); };

  const allData = { transactions, cards, fixed, invoices, assets, goals };
  const TAB_TITLE = { dashboard: "Dashboard", transactions: "Transações", cards: "Cartões", fixed: "Despesas Fixas & Dívidas", invoices: "Faturas", investments: "Investimentos & Metas", ai: "Assistente Financeiro IA", settings: "Configurações" };

  if (!logged) return <LoginScreen profiles={profiles} onLogin={handleLogin} onCreateProfile={handleCreateProfile} accent={accent} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: makeTheme(accent).bg, fontFamily: `'${font}', sans-serif`, color: makeTheme(accent).text }}>
      <link href={`https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700;800&display=swap`} rel="stylesheet" />
      <Sidebar active={active} setActive={handleSetActive} profile={currentProfile} onLogout={handleLogout} accent={accent} allProfiles={profiles} onSwitchProfile={handleSwitchProfile} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Header profile={currentProfile} onLogout={handleLogout} invoices={invoices} fixedExpenses={fixed} accent={accent} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSwitchProfile={handleSwitchProfile} allProfiles={profiles} />
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: makeTheme(accent).text, margin: 0 }}>{TAB_TITLE[active]}</h2>
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
