import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, Receipt,
  TrendingUp, Bot, Settings, LogOut, Plus, Filter,
  ChevronDown, Download, Upload, Eye, EyeOff, Trash2,
  CheckCircle2, Clock, Target, Wallet, Bell, Search,
  Send, X, Edit2, Save, BarChart2, PiggyBank, Shield
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ─── helpers ──────────────────────────────────────────────────────────────────
const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const fmt = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" });

const SEED_TRANSACTIONS = [
  { id: 1, name: "Dribbble", amount: -12, category: "Assinaturas", date: new Date().toISOString() },
  { id: 2, name: "Amazon", amount: -49.99, category: "Compras", date: new Date(Date.now() - 36e5).toISOString() },
  { id: 3, name: "Dianne Russell", amount: 250, category: "Receitas", date: new Date(Date.now() - 72e5).toISOString() },
  { id: 4, name: "Figma", amount: -20, category: "Assinaturas", date: new Date(Date.now() - 9e4 * 100).toISOString() },
  { id: 5, name: "Zara", amount: -75, category: "Compras", date: new Date(Date.now() - 1e6 * 10).toISOString() },
  { id: 6, name: "Stripe", amount: 860, category: "Receitas", date: new Date(Date.now() - 1e6 * 15).toISOString() },
];

const SEED_CARDS = [
  { id: 1, bank: "Nubank", number: "6566 8866 6364 4332", limit: 60000, balance: 4520.34, due: "09/25", color: "#7BCB68" },
  { id: 2, bank: "Itaú", number: "5412 3300 8821 9988", limit: 15000, balance: 1200, due: "12/26", color: "#A8D99B" },
];

const SEED_FIXED = [
  { id: 1, name: "Aluguel", amount: 2200, status: "Pago", installment: null },
  { id: 2, name: "Financiamento Auto", amount: 890, status: "Pendente", installment: { current: 8, total: 48 } },
  { id: 3, name: "Empréstimo Pessoal", amount: 500, status: "Pendente", installment: { current: 3, total: 12 } },
  { id: 4, name: "Internet", amount: 120, status: "Pago", installment: null },
];

const SEED_GOALS = [
  { id: 1, name: "Reserva de Emergência", target: 30000, current: 18500, color: "#7BCB68" },
  { id: 2, name: "Viagem Europa", target: 15000, current: 4200, color: "#60a5fa" },
  { id: 3, name: "MacBook Pro", target: 12000, current: 9800, color: "#f59e0b" },
];

const CATS = ["Assinaturas", "Compras", "Receitas", "Alimentação", "Saúde", "Lazer", "Transferência", "Outros"];
const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// ─── theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg: "#EEF5E7",
  card: "#F8FAF5",
  accent: "#7BCB68",
  accent2: "#A8D99B",
  text: "#1D1D1D",
  muted: "#7B7B7B",
  border: "#DFF0D8",
  danger: "#EF4444",
  warn: "#F59E0B",
};

const cardShadow = "0 2px 16px rgba(100,160,80,0.08), 0 1px 4px rgba(0,0,0,0.04)";

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const handle = () => {
    const storedUser = LS.get("fin_username", "Usuario");
    const storedPass = LS.get("fin_password", "1234");
    if (username === storedUser && password === storedPass) {
      LS.set("fin_logged", true);
      onLogin(username);
    } else {
      setErr("Usuário ou senha incorretos.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-family, 'Inter', sans-serif)" }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ background: T.card, borderRadius: 32, padding: "48px 40px", width: 380, boxShadow: "0 8px 48px rgba(100,160,80,0.15)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ background: T.accent, borderRadius: 12, padding: 8 }}>
            <Wallet size={22} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, color: T.text }}>Finance.</span>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 6 }}>Bem-vindo de volta</h2>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Acesse sua conta para continuar</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 }}>Usuário</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="Digite seu usuário"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: `1.5px solid ${T.border}`, fontSize: 14, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 }}>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
              placeholder="Digite sua senha"
              style={{ width: "100%", padding: "12px 16px", paddingRight: 44, borderRadius: 14, border: `1.5px solid ${T.border}`, fontSize: 14, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {err && <p style={{ color: T.danger, fontSize: 13, marginBottom: 16, textAlign: "center" }}>{err}</p>}
        <button
          onClick={handle}
          style={{ width: "100%", padding: "14px", borderRadius: 16, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", transition: "opacity .15s" }}
          onMouseEnter={e => e.target.style.opacity = 0.88}
          onMouseLeave={e => e.target.style.opacity = 1}
        >
          Entrar
        </button>
        <p style={{ fontSize: 12, color: T.muted, textAlign: "center", marginTop: 16 }}>
          Padrão: usuário <b>Usuario</b> / senha <b>1234</b>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transações", icon: ArrowLeftRight },
  { id: "cards", label: "Cartão", icon: CreditCard },
  { id: "fixed", label: "Despesas Fixas", icon: Receipt },
  { id: "investments", label: "Investimentos", icon: TrendingUp },
  { id: "ai", label: "Assistente IA", icon: Bot },
  { id: "settings", label: "Configurações", icon: Settings },
];

function Sidebar({ active, setActive, username, onLogout }) {
  return (
    <div style={{ width: 220, minWidth: 220, background: T.card, height: "100vh", display: "flex", flexDirection: "column", padding: "28px 16px 24px", boxShadow: "2px 0 12px rgba(0,0,0,0.03)", position: "sticky", top: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 8 }}>
        <div style={{ background: T.accent, borderRadius: 10, padding: 7 }}>
          <Wallet size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 19, color: T.text }}>Finance.</span>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 10, paddingLeft: 10, letterSpacing: 1 }}>MENU PRINCIPAL</p>
      {NAV.slice(0, 6).map(item => (
        <NavItem key={item.id} item={item} active={active} setActive={setActive} />
      ))}

      <p style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginTop: 20, marginBottom: 10, paddingLeft: 10, letterSpacing: 1 }}>GERAL</p>
      <NavItem item={NAV[6]} active={active} setActive={setActive} />
      <NavItem item={{ id: "logout", label: "Sair", icon: LogOut }} active={active} setActive={() => onLogout()} />

      <div style={{ marginTop: "auto", paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 15 }}>
            {username ? username[0].toUpperCase() : "U"}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{username}</p>
            <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Ver perfil</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, active, setActive }) {
  const isActive = active === item.id;
  const Icon = item.icon;
  return (
    <button
      onClick={() => setActive(item.id)}
      style={{
        display: "flex", alignItems: "center", gap: 11, width: "100%",
        padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer",
        background: isActive ? T.accent : "transparent",
        color: isActive ? "#fff" : T.muted,
        fontWeight: isActive ? 700 : 500, fontSize: 14,
        transition: "all .15s", marginBottom: 2, textAlign: "left"
      }}
    >
      <Icon size={17} />
      {item.label}
    </button>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ transactions, cards }) {
  const balance = transactions.reduce((a, t) => a + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  const catMap = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
  });
  const donutData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
  const DONUT_COLORS = ["#7BCB68", "#A8D99B", "#60a5fa", "#f59e0b", "#f87171", "#c084fc"];

  const weekData = WEEK_DAYS.map((d, i) => {
    const dayTx = transactions.filter(t => new Date(t.date).getDay() === (i + 1) % 7);
    return { name: d, value: dayTx.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0) };
  });

  const upcomingBills = [
    { name: "Adobe", icon: "🅰", amount: 20.99, date: "30 mai" },
    { name: "Freepik", icon: "🖌", amount: 15.00, date: "30 mai" },
    { name: "Google", icon: "G", amount: 12.00, date: "24 mai" },
  ];

  const mainCard = cards[0] || SEED_CARDS[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 20 }}>
      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ gridColumn: "1 / 3", background: T.card, borderRadius: 28, padding: "28px 32px", boxShadow: cardShadow, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: T.muted, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Saldo Disponível</p>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: T.text, margin: 0 }}>{fmt(balance)}</h1>
          <div style={{ display: "flex", gap: 28, marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Saldo no Cartão</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{fmt(mainCard.balance)}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.muted }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Limite de Crédito</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{fmt(mainCard.limit)}</p>
              </div>
            </div>
          </div>
        </div>
        <PhysicalCard card={mainCard} />
      </motion.div>

      {/* Upcoming Bills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: T.card, borderRadius: 28, padding: "24px 24px", boxShadow: cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: T.text, margin: 0 }}>Próximas Faturas</p>
          <span style={{ fontSize: 13, color: T.accent, fontWeight: 600, cursor: "pointer" }}>Ver todas</span>
        </div>
        {upcomingBills.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{b.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>{b.name}</p>
              <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Última cobrança {b.date}</p>
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{fmt(b.amount)}</span>
          </div>
        ))}
      </motion.div>

      {/* Donut Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ gridColumn: "2 / 3", background: T.card, borderRadius: 28, padding: "24px", boxShadow: cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: T.text, margin: 0 }}>Resumo de Gastos</p>
          <span style={{ fontSize: 12, color: T.muted }}>Este mês</span>
        </div>
        <div style={{ position: "relative", height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData.length ? donutData : [{ name: "Sem dados", value: 1 }]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>
              {income > 0 ? `+${Math.round(((income - expenses) / (expenses || 1)) * 100)}%` : "—"}
            </p>
            <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>vs mês ant.</p>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          {donutData.slice(0, 3).map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: DONUT_COLORS[i] }} />
                <span style={{ fontSize: 12, color: T.muted }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{fmt(d.value)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: T.card, borderRadius: 28, padding: "24px", boxShadow: cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: T.text, margin: 0 }}>Fluxo de Caixa</p>
          <span style={{ fontSize: 12, color: T.muted }}>Esta semana</span>
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "8px 0 16px" }}>{fmt(income)}</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weekData} barSize={14}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: T.muted }} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
            <Bar dataKey="value" fill={T.accent} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        style={{ background: T.accent, borderRadius: 28, padding: "24px", boxShadow: cardShadow, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 6 }}>Total de Entradas</p>
        <p style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 }}>{fmt(income)}</p>
        <div style={{ marginTop: 12, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 4 }}>
          <div style={{ width: `${Math.min((income / (income + expenses || 1)) * 100, 100)}%`, height: "100%", background: "#fff", borderRadius: 4 }} />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        style={{ background: T.card, borderRadius: 28, padding: "24px", boxShadow: cardShadow, display: "flex", flexDirection: "column", justifyContent: "center", border: `1.5px solid ${T.border}` }}>
        <p style={{ color: T.muted, fontSize: 12, marginBottom: 6 }}>Total de Saídas</p>
        <p style={{ color: T.danger, fontSize: 26, fontWeight: 800, margin: 0 }}>-{fmt(expenses)}</p>
        <div style={{ marginTop: 12, height: 4, background: T.border, borderRadius: 4 }}>
          <div style={{ width: `${Math.min((expenses / (income + expenses || 1)) * 100, 100)}%`, height: "100%", background: T.danger, borderRadius: 4 }} />
        </div>
      </motion.div>
    </div>
  );
}

function PhysicalCard({ card }) {
  return (
    <div style={{ width: 200, height: 118, background: `linear-gradient(135deg, ${card.color} 0%, #5aa847 100%)`, borderRadius: 18, padding: "16px 18px", boxShadow: "0 8px 24px rgba(100,180,80,0.3)", position: "relative", overflow: "hidden", color: "#fff", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
      <div style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <Wallet size={18} color="rgba(255,255,255,0.9)" />
        <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>{card.bank}</span>
      </div>
      <p style={{ fontSize: 11, letterSpacing: 2, margin: "0 0 6px", opacity: 0.9 }}>{card.number}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: 9, opacity: 0.7, margin: 0 }}>Saldo</p>
          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{fmt(card.balance)}</p>
        </div>
        <p style={{ fontSize: 10, opacity: 0.7, margin: 0 }}>Válido {card.due}</p>
      </div>
    </div>
  );
}

// ─── Transactions Tab ──────────────────────────────────────────────────────────
function TransactionsTab({ transactions, setTransactions }) {
  const [form, setForm] = useState({ name: "", amount: "", category: "Compras", type: "expense", date: new Date().toISOString().slice(0, 10) });
  const [filter, setFilter] = useState("Todos");

  const add = () => {
    if (!form.name || !form.amount) return;
    const tx = {
      id: Date.now(),
      name: form.name,
      amount: form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
      category: form.category,
      date: new Date(form.date).toISOString(),
    };
    const updated = [tx, ...transactions];
    setTransactions(updated);
    LS.set("fin_transactions", updated);
    setForm({ name: "", amount: "", category: "Compras", type: "expense", date: new Date().toISOString().slice(0, 10) });
  };

  const remove = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    LS.set("fin_transactions", updated);
  };

  const filtered = filter === "Todos" ? transactions : transactions.filter(t => t.category === filter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
      <div style={{ background: T.card, borderRadius: 28, padding: 28, boxShadow: cardShadow, height: "fit-content" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 20 }}>Nova Transação</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["expense", "income"].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: t === "income" ? "Receitas" : "Compras" }))}
              style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                background: form.type === t ? (t === "expense" ? T.danger : T.accent) : T.bg,
                color: form.type === t ? "#fff" : T.muted }}>
              {t === "expense" ? "Despesa" : "Receita"}
            </button>
          ))}
        </div>
        {[
          { label: "Descrição", key: "name", type: "text", placeholder: "Ex: Supermercado" },
          { label: "Valor (R$)", key: "amount", type: "number", placeholder: "0,00" },
          { label: "Data", key: "date", type: "date" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>Categoria</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={add}
          style={{ width: "100%", padding: "13px", borderRadius: 14, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          + Adicionar
        </button>
      </div>

      <div style={{ background: T.card, borderRadius: 28, padding: 28, boxShadow: cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>Histórico</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Todos", ...CATS].map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                  background: filter === c ? T.accent : T.bg, color: filter === c ? "#fff" : T.muted }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 12px", marginBottom: 10, padding: "0 4px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>TRANSAÇÃO</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>VALOR</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>AÇÃO</span>
        </div>
        {filtered.length === 0 && <p style={{ color: T.muted, textAlign: "center", padding: 32 }}>Nenhuma transação</p>}
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 12px", alignItems: "center", padding: "12px 4px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                {t.amount > 0 ? "💰" : "🛒"}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{fmtDate(t.date)} · {t.category}</p>
              </div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: t.amount > 0 ? T.accent : T.danger }}>{t.amount > 0 ? "+" : ""}{fmt(t.amount)}</span>
            <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}>
              <Trash2 size={15} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Cards Tab ─────────────────────────────────────────────────────────────────
function CardsTab({ cards, setCards }) {
  const [form, setForm] = useState({ bank: "", number: "", limit: "", balance: "", due: "", color: "#7BCB68" });
  const [show, setShow] = useState(false);

  const add = () => {
    if (!form.bank || !form.number) return;
    const updated = [...cards, { id: Date.now(), ...form, limit: parseFloat(form.limit) || 0, balance: parseFloat(form.balance) || 0 }];
    setCards(updated);
    LS.set("fin_cards", updated);
    setForm({ bank: "", number: "", limit: "", balance: "", due: "", color: "#7BCB68" });
    setShow(false);
  };

  const remove = (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    LS.set("fin_cards", updated);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 20, color: T.text, margin: 0 }}>Meus Cartões</h2>
        <button onClick={() => setShow(!show)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 14, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
          <Plus size={15} /> Novo Cartão
        </button>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: cardShadow, marginBottom: 20, overflow: "hidden" }}>
            <h4 style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Adicionar Cartão</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Banco", key: "bank", placeholder: "Ex: Nubank" },
                { label: "Número", key: "number", placeholder: "0000 0000 0000 0000" },
                { label: "Validade", key: "due", placeholder: "MM/AA" },
                { label: "Limite (R$)", key: "limit", placeholder: "10000" },
                { label: "Saldo (R$)", key: "balance", placeholder: "0" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
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
              <button onClick={add} style={{ padding: "10px 24px", borderRadius: 12, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Salvar</button>
              <button onClick={() => setShow(false)} style={{ padding: "10px 24px", borderRadius: 12, background: T.bg, color: T.muted, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Cancelar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {cards.map(card => (
          <motion.div key={card.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: T.card, borderRadius: 24, padding: 20, boxShadow: cardShadow }}>
            <PhysicalCard card={card} />
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.muted }}>Uso do limite</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{Math.round((card.balance / card.limit) * 100)}%</span>
              </div>
              <div style={{ height: 6, background: T.bg, borderRadius: 3 }}>
                <div style={{ width: `${Math.min((card.balance / card.limit) * 100, 100)}%`, height: "100%", background: card.color, borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <div>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Saldo</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>{fmt(card.balance)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Limite</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>{fmt(card.limit)}</p>
                </div>
                <button onClick={() => remove(card.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, alignSelf: "flex-end" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Fixed Expenses Tab ────────────────────────────────────────────────────────
function FixedTab({ fixed, setFixed }) {
  const [form, setForm] = useState({ name: "", amount: "", hasInstallment: false, current: "", total: "" });

  const add = () => {
    if (!form.name || !form.amount) return;
    const item = {
      id: Date.now(),
      name: form.name,
      amount: parseFloat(form.amount),
      status: "Pendente",
      installment: form.hasInstallment ? { current: parseInt(form.current), total: parseInt(form.total) } : null,
    };
    const updated = [...fixed, item];
    setFixed(updated);
    LS.set("fin_fixed", updated);
    setForm({ name: "", amount: "", hasInstallment: false, current: "", total: "" });
  };

  const toggle = (id) => {
    const updated = fixed.map(f => f.id === id ? { ...f, status: f.status === "Pago" ? "Pendente" : "Pago" } : f);
    setFixed(updated);
    LS.set("fin_fixed", updated);
  };

  const remove = (id) => {
    const updated = fixed.filter(f => f.id !== id);
    setFixed(updated);
    LS.set("fin_fixed", updated);
  };

  const total = fixed.reduce((a, f) => a + f.amount, 0);
  const paid = fixed.filter(f => f.status === "Pago").reduce((a, f) => a + f.amount, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      <div>
        <div style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: cardShadow, marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Nova Despesa Fixa</h4>
          {[{ label: "Nome", key: "name", placeholder: "Ex: Aluguel" }, { label: "Valor (R$)", key: "amount", placeholder: "0" }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={form.hasInstallment} onChange={e => setForm(p => ({ ...p, hasInstallment: e.target.checked }))} />
            <span style={{ fontSize: 13, color: T.text }}>Parcelado?</span>
          </label>
          {form.hasInstallment && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>Parcela atual</label>
                <input type="number" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>Total parcelas</label>
                <input type="number" value={form.total} onChange={e => setForm(p => ({ ...p, total: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          )}
          <button onClick={add}
            style={{ width: "100%", padding: "12px", borderRadius: 14, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
            Adicionar
          </button>
        </div>

        <div style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: cardShadow }}>
          <p style={{ fontSize: 13, color: T.muted, margin: "0 0 4px" }}>Total de despesas fixas</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: T.danger, margin: "0 0 12px" }}>{fmt(total)}</p>
          <div style={{ height: 6, background: T.bg, borderRadius: 3, marginBottom: 8 }}>
            <div style={{ width: `${total > 0 ? (paid / total) * 100 : 0}%`, height: "100%", background: T.accent, borderRadius: 3, transition: "width .4s" }} />
          </div>
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{fmt(paid)} pago de {fmt(total)}</p>
        </div>
      </div>

      <div style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 20 }}>Despesas & Dívidas</h3>
        {fixed.length === 0 && <p style={{ color: T.muted, textAlign: "center", padding: 32 }}>Nenhuma despesa cadastrada</p>}
        {fixed.map(item => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{item.name}</p>
                {item.installment && (
                  <span style={{ fontSize: 11, background: T.bg, padding: "2px 8px", borderRadius: 8, color: T.muted, fontWeight: 600 }}>
                    {item.installment.current}/{item.installment.total}x
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>{fmt(item.amount)}/mês</p>
            </div>
            <button onClick={() => toggle(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: item.status === "Pago" ? "#dcfce7" : "#fef3c7",
                color: item.status === "Pago" ? "#16a34a" : "#d97706" }}>
              {item.status === "Pago" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
              {item.status}
            </button>
            <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, marginLeft: 12 }}>
              <Trash2 size={15} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Investments & Goals Tab ───────────────────────────────────────────────────
function InvestmentsTab({ goals, setGoals }) {
  const [assets] = useState([
    { name: "Tesouro Selic 2029", type: "Renda Fixa", amount: 12500, return: 2.4 },
    { name: "PETR4", type: "Ações", amount: 3200, return: -1.2 },
    { name: "MXRF11", type: "FIIs", amount: 5800, return: 0.9 },
    { name: "BTC", type: "Cripto", amount: 2100, return: 8.3 },
  ]);
  const [goalForm, setGoalForm] = useState({ name: "", target: "", current: "", color: "#7BCB68" });

  const addGoal = () => {
    if (!goalForm.name || !goalForm.target) return;
    const updated = [...goals, { id: Date.now(), ...goalForm, target: parseFloat(goalForm.target), current: parseFloat(goalForm.current) || 0 }];
    setGoals(updated);
    LS.set("fin_goals", updated);
    setGoalForm({ name: "", target: "", current: "", color: "#7BCB68" });
  };

  const updateGoal = (id, delta) => {
    const updated = goals.map(g => g.id === id ? { ...g, current: Math.min(g.current + delta, g.target) } : g);
    setGoals(updated);
    LS.set("fin_goals", updated);
  };

  const removeGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    LS.set("fin_goals", updated);
  };

  const totalInvested = assets.reduce((a, i) => a + i.amount, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 6 }}>Portfólio</h3>
        <p style={{ fontSize: 28, fontWeight: 800, color: T.accent, marginBottom: 20 }}>{fmt(totalInvested)}</p>
        {assets.map((a, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>{a.name}</p>
              <span style={{ fontSize: 11, background: T.bg, padding: "2px 8px", borderRadius: 8, color: T.muted }}>{a.type}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{fmt(a.amount)}</p>
              <p style={{ fontSize: 12, color: a.return >= 0 ? T.accent : T.danger, margin: 0, fontWeight: 600 }}>
                {a.return >= 0 ? "+" : ""}{a.return}%
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: cardShadow, marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 14 }}>Nova Meta</h4>
          {[{ l: "Nome", k: "name", p: "Ex: Reserva" }, { l: "Objetivo (R$)", k: "target", p: "30000" }, { l: "Atual (R$)", k: "current", p: "0" }].map(f => (
            <div key={f.k} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 4 }}>{f.l}</label>
              <input value={goalForm[f.k]} onChange={e => setGoalForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.p}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 4 }}>Cor</label>
            <input type="color" value={goalForm.color} onChange={e => setGoalForm(p => ({ ...p, color: e.target.value }))}
              style={{ width: "100%", height: 38, borderRadius: 12, border: `1.5px solid ${T.border}`, cursor: "pointer" }} />
          </div>
          <button onClick={addGoal}
            style={{ width: "100%", padding: "12px", borderRadius: 14, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
            Criar Meta
          </button>
        </div>

        <div style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: cardShadow }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>Metas</h3>
          {goals.map(g => (
            <div key={g.id} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: g.color }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{g.name}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: T.muted }}>{fmt(g.current)} / {fmt(g.target)}</span>
                  <button onClick={() => updateGoal(g.id, 100)} style={{ background: T.accent, border: "none", borderRadius: 6, color: "#fff", fontSize: 12, padding: "2px 7px", cursor: "pointer" }}>+R$100</button>
                  <button onClick={() => removeGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={14} /></button>
                </div>
              </div>
              <div style={{ height: 8, background: T.bg, borderRadius: 4 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((g.current / g.target) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", background: g.color, borderRadius: 4 }}
                />
              </div>
              <p style={{ fontSize: 11, color: T.muted, margin: "4px 0 0", textAlign: "right" }}>
                {Math.round((g.current / g.target) * 100)}% concluído
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Chat Tab ───────────────────────────────────────────────────────────────
function AITab({ transactions, goals }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Olá! Sou seu assistente financeiro. Posso analisar suas finanças e dar conselhos personalizados. Como posso ajudar?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const balance = transactions.reduce((a, t) => a + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
  const catMap = {};
  transactions.filter(t => t.amount < 0).forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount); });
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);

    const context = `Dados financeiros do usuário:
- Saldo atual: ${fmt(balance)}
- Total entradas: ${fmt(income)}
- Total saídas: ${fmt(expenses)}
- Categoria com mais gastos: ${topCat ? `${topCat[0]} (${fmt(topCat[1])})` : "N/A"}
- Número de metas: ${goals.length}
- Metas em andamento: ${goals.map(g => `${g.name}: ${Math.round((g.current / g.target) * 100)}%`).join(", ")}

Responda em português brasileiro, de forma concisa, amigável e com emojis ocasionais. Dê conselhos práticos baseados nesses dados quando relevante.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: [
            ...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Desculpe, não consegui responder agora.";
      setMessages(m => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Erro ao conectar com a IA. Tente novamente." }]);
    }
    setLoading(false);
  };

  const quickActions = [
    "Como está minha saúde financeira?",
    "Onde posso economizar?",
    "Como atingir minhas metas mais rápido?",
    "Analise meus gastos este mês",
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, height: "calc(100vh - 140px)" }}>
      <div style={{ background: T.card, borderRadius: 24, boxShadow: cardShadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: T.text, margin: 0 }}>Assistente Financeiro IA</p>
            <p style={{ fontSize: 12, color: T.accent, margin: 0 }}>● Online</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "72%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? T.accent : T.bg,
                color: m.role === "user" ? "#fff" : T.text,
                fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap"
              }}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 16px" }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
              ))}
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Pergunte algo sobre suas finanças..."
            style={{ flex: 1, padding: "12px 16px", borderRadius: 16, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none" }}
          />
          <button onClick={send} disabled={loading}
            style={{ width: 46, height: 46, borderRadius: "50%", background: T.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={18} color="#fff" />
          </button>
        </div>
      </div>

      <div>
        <div style={{ background: T.card, borderRadius: 24, padding: 20, boxShadow: cardShadow, marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 12 }}>Ações Rápidas</p>
          {quickActions.map((q, i) => (
            <button key={i} onClick={() => { setInput(q); }}
              style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 12, cursor: "pointer", marginBottom: 8, fontWeight: 500 }}>
              {q}
            </button>
          ))}
        </div>

        <div style={{ background: T.card, borderRadius: 24, padding: 20, boxShadow: cardShadow }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 12 }}>Resumo Financeiro</p>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, color: T.muted, margin: "0 0 2px" }}>Saldo Atual</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: balance >= 0 ? T.accent : T.danger, margin: 0 }}>{fmt(balance)}</p>
          </div>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, color: T.muted, margin: "0 0 2px" }}>Entradas</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.accent, margin: 0 }}>+{fmt(income)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: T.muted, margin: "0 0 2px" }}>Saídas</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.danger, margin: 0 }}>-{fmt(expenses)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ username, setUsername, setFont }) {
  const [newUser, setNewUser] = useState(username);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const fonts = ["Inter", "Roboto", "Poppins", "Nunito", "DM Sans"];
  const [selectedFont, setSelectedFont] = useState(LS.get("fin_font", "Inter"));

  const saveUser = () => {
    LS.set("fin_username", newUser);
    setUsername(newUser);
    setUserMsg("Usuário atualizado!");
    setTimeout(() => setUserMsg(""), 2000);
  };

  const savePass = () => {
    const stored = LS.get("fin_password", "1234");
    if (oldPass !== stored) { setPassMsg("Senha atual incorreta."); return; }
    LS.set("fin_password", newPass);
    setOldPass(""); setNewPass("");
    setPassMsg("Senha alterada com sucesso!");
    setTimeout(() => setPassMsg(""), 2000);
  };

  const applyFont = (f) => {
    setSelectedFont(f);
    setFont(f);
    LS.set("fin_font", f);
  };

  const backupJSON = () => {
    const data = {
      transactions: LS.get("fin_transactions", []),
      cards: LS.get("fin_cards", SEED_CARDS),
      fixed: LS.get("fin_fixed", SEED_FIXED),
      goals: LS.get("fin_goals", SEED_GOALS),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "finance-backup.json"; a.click();
  };

  const fakeGDrive = () => alert("Simulação: Backup enviado para o Google Drive com sucesso! ✅");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: T.card, borderRadius: 24, padding: 28, boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 20 }}>Perfil</h3>
        <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>Nome de Usuário</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <input value={newUser} onChange={e => setNewUser(e.target.value)}
            style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none" }} />
          <button onClick={saveUser}
            style={{ padding: "11px 18px", borderRadius: 12, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Save size={14} /> Salvar
          </button>
        </div>
        {userMsg && <p style={{ fontSize: 12, color: T.accent, margin: 0 }}>{userMsg}</p>}

        <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "24px 0" }} />

        <h4 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Alterar Senha</h4>
        {[{ l: "Senha Atual", v: oldPass, set: setOldPass }, { l: "Nova Senha", v: newPass, set: setNewPass }].map((f, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>{f.l}</label>
            <input type="password" value={f.v} onChange={e => f.set(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <button onClick={savePass}
          style={{ padding: "11px 20px", borderRadius: 12, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
          Alterar Senha
        </button>
        {passMsg && <p style={{ fontSize: 12, color: passMsg.includes("sucesso") ? T.accent : T.danger, margin: "8px 0 0" }}>{passMsg}</p>}
      </div>

      <div>
        <div style={{ background: T.card, borderRadius: 24, padding: 28, boxShadow: cardShadow, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>Tipografia</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {fonts.map(f => (
              <button key={f} onClick={() => applyFont(f)}
                style={{ padding: "12px", borderRadius: 12, border: `2px solid ${selectedFont === f ? T.accent : T.border}`,
                  background: selectedFont === f ? "#f0fdf4" : T.bg,
                  color: selectedFont === f ? T.accent : T.text,
                  fontFamily: f, fontWeight: selectedFont === f ? 700 : 500, fontSize: 14, cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: T.card, borderRadius: 24, padding: 28, boxShadow: cardShadow }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>Backup & Dados</h3>
          <button onClick={backupJSON}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 14, background: T.bg, border: `1.5px solid ${T.border}`, cursor: "pointer", marginBottom: 10, color: T.text, fontWeight: 600, fontSize: 13 }}>
            <Download size={18} color={T.accent} /> Exportar Backup (JSON)
          </button>
          <button onClick={fakeGDrive}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 14, background: T.bg, border: `1.5px solid ${T.border}`, cursor: "pointer", color: T.text, fontWeight: 600, fontSize: 13 }}>
            <Upload size={18} color="#4285F4" /> Sincronizar Google Drive
          </button>
          <p style={{ fontSize: 11, color: T.muted, marginTop: 10 }}>Todos os dados são armazenados localmente no seu navegador.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [logged, setLogged] = useState(() => LS.get("fin_logged", false));
  const [username, setUsername] = useState(() => LS.get("fin_username", "Usuario"));
  const [active, setActive] = useState("dashboard");
  const [font, setFont] = useState(() => LS.get("fin_font", "Inter"));

  const [transactions, setTransactions] = useState(() => LS.get("fin_transactions", SEED_TRANSACTIONS));
  const [cards, setCards] = useState(() => LS.get("fin_cards", SEED_CARDS));
  const [fixed, setFixed] = useState(() => LS.get("fin_fixed", SEED_FIXED));
  const [goals, setGoals] = useState(() => LS.get("fin_goals", SEED_GOALS));

  const logout = () => {
    LS.set("fin_logged", false);
    setLogged(false);
  };

  if (!logged) return <LoginScreen onLogin={(u) => { setUsername(u); setLogged(true); }} />;

  const tabContent = {
    dashboard: <DashboardTab transactions={transactions} cards={cards} />,
    transactions: <TransactionsTab transactions={transactions} setTransactions={setTransactions} />,
    cards: <CardsTab cards={cards} setCards={setCards} />,
    fixed: <FixedTab fixed={fixed} setFixed={setFixed} />,
    investments: <InvestmentsTab goals={goals} setGoals={setGoals} />,
    ai: <AITab transactions={transactions} goals={goals} />,
    settings: <SettingsTab username={username} setUsername={setUsername} setFont={setFont} />,
  };

  const tabTitles = {
    dashboard: "Dashboard",
    transactions: "Transações",
    cards: "Cartões",
    fixed: "Despesas Fixas & Dívidas",
    investments: "Investimentos & Metas",
    ai: "Assistente Financeiro IA",
    settings: "Configurações",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: `'${font}', sans-serif`, color: T.text }}>
      <link href={`https://fonts.googleapis.com/css2?family=${font.replace(" ", "+")}:wght@400;500;600;700;800&display=swap`} rel="stylesheet" />

      <Sidebar active={active} setActive={setActive} username={username} onLogout={logout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: T.card, padding: "16px 32px", display: "flex", alignItems: "center", gap: 16, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
            <input placeholder="Buscar algo..."
              style={{ padding: "10px 16px 10px 40px", borderRadius: 14, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.bg, color: T.text, outline: "none", width: 280 }} />
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, position: "relative" }}>
            <Bell size={20} />
            <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: T.accent, border: "2px solid #fff" }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 15 }}>
              {username[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{username}</p>
              <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Área de trabalho</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>{tabTitles[active]}</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {tabContent[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
