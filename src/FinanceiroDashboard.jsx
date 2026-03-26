import { useState, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar
} from "recharts";
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, Landmark, TrendingUp,
  Menu, X, Plus, Trash2, Target, ChevronRight, Wallet, TrendingDown,
  Banknote, CheckCircle2, Circle, Sparkles, PiggyBank, BarChart3
} from "lucide-react";

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const today = () => new Date().toISOString().split("T")[0];
const uid = () => Math.random().toString(36).slice(2, 9);

const STORAGE = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const CATS = ["Alimentação","Transporte","Lazer","Saúde","Educação","Moradia","Vestuário","Outros","Salário","Freelance","Investimentos"];
const CAT_COLORS = {
  Alimentação:"#4ade80",Transporte:"#34d399",Lazer:"#6ee7b7",Saúde:"#a7f3d0",
  Educação:"#86efac",Moradia:"#bbf7d0",Vestuário:"#d1fae5",Outros:"#ecfdf5",
  Salário:"#059669",Freelance:"#10b981",Investimentos:"#047857",
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Badge({ cat }) {
  const c = CAT_COLORS[cat] || "#d1fae5";
  return (
    <span style={{ background: c, color: "#065f46", fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 99 }}>{cat}</span>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`} style={style}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "text-emerald-600", iconBg = "bg-emerald-50" }) {
  return (
    <Card className="flex items-start gap-4">
      <div className={`${iconBg} p-3 rounded-xl`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

function ProgressBar({ value, max, color = "#10b981" }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div style={{ width: `${pct}%`, background: color, transition: "width .4s" }} className="h-2 rounded-full" />
    </div>
  );
}

function SectionHeader({ title, onAdd, addLabel = "Adicionar" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-700">{title}</h2>
      {onAdd && (
        <button onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" />{addLabel}
        </button>
      )}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50";
const SELECT = INPUT + " cursor-pointer";
const BTN = "w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors";

// ─── VISÃO GERAL ──────────────────────────────────────────────────────────────
function VisaoGeral({ transactions, investments, goals, cards, fixedExpenses, debts }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter(t => t.date?.startsWith(currentMonth));
  const totalReceitas = monthTx.filter(t => t.type === "receita").reduce((a, t) => a + t.value, 0);
  const totalDespesas = monthTx.filter(t => t.type === "gasto").reduce((a, t) => a + t.value, 0);
  const totalCartoes = cards.reduce((a, c) => a + (c.invoiceTotal || 0), 0);
  const totalInvestido = investments.reduce((a, i) => a + i.value, 0);
  const saldo = totalReceitas - totalDespesas - totalCartoes;

  // Gastos por categoria (donut)
  const catMap = {};
  monthTx.filter(t => t.type === "gasto").forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.value;
  });
  const donutData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Tendência mensal (últimos 6 meses)
  const lineData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const ym = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("pt-BR", { month: "short" });
    const rec = transactions.filter(t => t.date?.startsWith(ym) && t.type === "receita").reduce((a, t) => a + t.value, 0);
    const desp = transactions.filter(t => t.date?.startsWith(ym) && t.type === "gasto").reduce((a, t) => a + t.value, 0);
    return { mes: label, Receitas: rec, Despesas: desp };
  });

  // AI insight simulado
  const insights = [
    totalDespesas > totalReceitas ? `⚠️ Atenção! Suas despesas superaram as receitas este mês.`
      : `✅ Parabéns! Você economizou ${fmt(saldo)} este mês.`,
    totalInvestido > 0 ? `📈 Patrimônio investido: ${fmt(totalInvestido)}.` : `💡 Que tal começar a investir este mês?`,
    goals.length > 0 ? `🎯 Você tem ${goals.length} meta(s) ativa(s). Continue firme!` : `🎯 Adicione metas de economia para focar seus objetivos.`,
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Saldo Atual" value={fmt(saldo)} iconBg="bg-emerald-50" color="text-emerald-600" />
        <StatCard icon={Banknote} label="Receitas do Mês" value={fmt(totalReceitas)} iconBg="bg-green-50" color="text-green-600" />
        <StatCard icon={TrendingDown} label="Despesas do Mês" value={fmt(totalDespesas + totalCartoes)} iconBg="bg-rose-50" color="text-rose-500" />
        <StatCard icon={TrendingUp} label="Total Investido" value={fmt(totalInvestido)} iconBg="bg-teal-50" color="text-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <p className="text-sm font-semibold text-gray-600 mb-4">Gastos por Categoria</p>
          {donutData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Sem gastos registrados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  dataKey="value" paddingAngle={3}>
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={CAT_COLORS[entry.name] || `hsl(${i * 40}, 65%, 65%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-600 mb-4">Fluxo de Caixa — Últimos 6 Meses</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend iconSize={8} />
              <Line type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700">Insights Financeiros</p>
        </div>
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <p key={i} className="text-sm text-emerald-800">{ins}</p>
          ))}
        </div>
      </Card>

      {/* Metas */}
      {goals.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-gray-600 mb-4">Metas de Economia</p>
          <div className="space-y-4">
            {goals.map(g => (
              <div key={g.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{g.name}</span>
                  <span className="text-gray-400">{fmt(g.saved)} / {fmt(g.target)}</span>
                </div>
                <ProgressBar value={g.saved} max={g.target} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── TRANSAÇÕES ───────────────────────────────────────────────────────────────
function Transacoes({ transactions, setTransactions }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "gasto", desc: "", value: "", category: "Alimentação", date: today() });

  const save = () => {
    if (!form.desc || !form.value) return;
    const tx = [...transactions, { ...form, id: uid(), value: parseFloat(form.value) }];
    setTransactions(tx);
    setForm({ type: "gasto", desc: "", value: "", category: "Alimentação", date: today() });
    setShowForm(false);
  };

  const del = (id) => setTransactions(transactions.filter(t => t.id !== id));

  const sorted = [...transactions].sort((a, b) => b.date?.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <SectionHeader title="Transações" onAdd={() => setShowForm(true)} addLabel="Nova Transação" />

      {showForm && (
        <Modal title="Nova Transação" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <select className={SELECT} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="gasto">Gasto</option>
              <option value="receita">Receita</option>
            </select>
            <input className={INPUT} placeholder="Descrição" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
            <input className={INPUT} type="number" placeholder="Valor R$" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            <select className={SELECT} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className={INPUT} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <button className={BTN} onClick={save}>Salvar</button>
          </div>
        </Modal>
      )}

      <Card>
        {sorted.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-sm">Nenhuma transação registrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3 pr-4">Descrição</th>
                  <th className="pb-3 pr-4">Categoria</th>
                  <th className="pb-3 pr-4">Data</th>
                  <th className="pb-3 pr-4 text-right">Valor</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-700">{t.desc}</td>
                    <td className="py-3 pr-4"><Badge cat={t.category} /></td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{t.date}</td>
                    <td className={`py-3 pr-4 text-right font-bold ${t.type === "receita" ? "text-emerald-600" : "text-rose-500"}`}>
                      {t.type === "receita" ? "+" : "-"}{fmt(t.value)}
                    </td>
                    <td className="py-3">
                      <button onClick={() => del(t.id)} className="text-gray-300 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── CARTÕES ──────────────────────────────────────────────────────────────────
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
  "linear-gradient(135deg, #134e4a 0%, #0f766e 100%)",
  "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
  "linear-gradient(135deg, #312e81 0%, #6d28d9 100%)",
];

function CreditCards({ cards, setCards }) {
  const [showCardForm, setShowCardForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [cardForm, setCardForm] = useState({ name: "", flag: "Visa", limit: "", dueDay: "" });
  const [expForm, setExpForm] = useState({ cardId: "", desc: "", value: "", category: "Alimentação", date: today() });

  const saveCard = () => {
    if (!cardForm.name || !cardForm.limit) return;
    setCards([...cards, { ...cardForm, id: uid(), limit: parseFloat(cardForm.limit), invoiceTotal: 0, expenses: [], gradientIndex: cards.length % 4 }]);
    setCardForm({ name: "", flag: "Visa", limit: "", dueDay: "" });
    setShowCardForm(false);
  };

  const saveExpense = () => {
    if (!expForm.cardId || !expForm.value) return;
    setCards(cards.map(c => c.id === expForm.cardId ? {
      ...c,
      invoiceTotal: (c.invoiceTotal || 0) + parseFloat(expForm.value),
      expenses: [...(c.expenses || []), { ...expForm, id: uid(), value: parseFloat(expForm.value) }]
    } : c));
    setExpForm({ cardId: "", desc: "", value: "", category: "Alimentação", date: today() });
    setShowExpenseForm(false);
  };

  const delCard = (id) => setCards(cards.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      <SectionHeader title="Cartões de Crédito" onAdd={() => setShowCardForm(true)} addLabel="Novo Cartão" />

      {showCardForm && (
        <Modal title="Adicionar Cartão" onClose={() => setShowCardForm(false)}>
          <div className="space-y-3">
            <input className={INPUT} placeholder="Nome do Banco / Cartão" value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })} />
            <select className={SELECT} value={cardForm.flag} onChange={e => setCardForm({ ...cardForm, flag: e.target.value })}>
              {["Visa","Mastercard","Elo","American Express","Hipercard"].map(f => <option key={f}>{f}</option>)}
            </select>
            <input className={INPUT} type="number" placeholder="Limite Total R$" value={cardForm.limit} onChange={e => setCardForm({ ...cardForm, limit: e.target.value })} />
            <input className={INPUT} type="number" placeholder="Dia de Vencimento" value={cardForm.dueDay} onChange={e => setCardForm({ ...cardForm, dueDay: e.target.value })} />
            <button className={BTN} onClick={saveCard}>Salvar Cartão</button>
          </div>
        </Modal>
      )}

      {showExpenseForm && (
        <Modal title="Lançar Gasto no Cartão" onClose={() => setShowExpenseForm(false)}>
          <div className="space-y-3">
            <select className={SELECT} value={expForm.cardId} onChange={e => setExpForm({ ...expForm, cardId: e.target.value })}>
              <option value="">Selecionar cartão...</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className={INPUT} placeholder="Descrição" value={expForm.desc} onChange={e => setExpForm({ ...expForm, desc: e.target.value })} />
            <input className={INPUT} type="number" placeholder="Valor R$" value={expForm.value} onChange={e => setExpForm({ ...expForm, value: e.target.value })} />
            <select className={SELECT} value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className={INPUT} type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} />
            <button className={BTN} onClick={saveExpense}>Salvar Gasto</button>
          </div>
        </Modal>
      )}

      {/* Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) => {
          const used = c.invoiceTotal || 0;
          const avail = Math.max(0, c.limit - used);
          const pct = c.limit ? Math.min(100, (used / c.limit) * 100) : 0;
          return (
            <div key={c.id} className="rounded-2xl overflow-hidden shadow-md text-white relative"
              style={{ background: CARD_GRADIENTS[c.gradientIndex ?? i % 4], minHeight: 170 }}>
              <div className="p-5 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs opacity-60 uppercase tracking-widest">Cartão</p>
                    <p className="font-bold text-lg mt-0.5">{c.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">{c.flag}</span>
                    <button onClick={() => delCard(c.id)} className="opacity-50 hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs opacity-70 mb-1.5">
                    <span>Fatura: {fmt(used)}</span>
                    <span>Disponível: {fmt(avail)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${pct}%`, background: pct > 80 ? "#fbbf24" : "#6ee7b7" }} className="h-1.5 rounded-full transition-all" />
                  </div>
                  {c.dueDay && <p className="text-xs opacity-50 mt-2">Vencimento: dia {c.dueDay}</p>}
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={() => setShowCardForm(true)}
          className="border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-emerald-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors py-10">
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Adicionar cartão</span>
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Lançar Gasto no Cartão
        </button>
      </div>

      {/* Expenses list per card */}
      {cards.map(c => c.expenses?.length > 0 && (
        <Card key={c.id + "-list"}>
          <p className="text-sm font-semibold text-gray-700 mb-3">{c.name} — Fatura</p>
          <div className="space-y-2">
            {c.expenses.map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{e.desc}</span>
                <div className="flex items-center gap-3">
                  <Badge cat={e.category} />
                  <span className="font-bold text-rose-500">{fmt(e.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── COMPROMISSOS FIXOS ───────────────────────────────────────────────────────
function Compromissos({ fixedExpenses, setFixedExpenses, debts, setDebts }) {
  const [showFixed, setShowFixed] = useState(false);
  const [showDebt, setShowDebt] = useState(false);
  const [fxForm, setFxForm] = useState({ name: "", value: "", dueDay: "", currentInstall: "", totalInstall: "", paid: false });
  const [dtForm, setDtForm] = useState({ creditor: "", total: "", date: today(), dueDate: "", currentInstall: "", totalInstall: "", paid: false });

  const saveFx = () => {
    if (!fxForm.name || !fxForm.value) return;
    setFixedExpenses([...fixedExpenses, { ...fxForm, id: uid(), value: parseFloat(fxForm.value) }]);
    setFxForm({ name: "", value: "", dueDay: "", currentInstall: "", totalInstall: "", paid: false });
    setShowFixed(false);
  };

  const saveDt = () => {
    if (!dtForm.creditor || !dtForm.total) return;
    setDebts([...debts, { ...dtForm, id: uid(), total: parseFloat(dtForm.total) }]);
    setDtForm({ creditor: "", total: "", date: today(), dueDate: "", currentInstall: "", totalInstall: "", paid: false });
    setShowDebt(false);
  };

  const toggleFx = (id) => setFixedExpenses(fixedExpenses.map(f => f.id === id ? { ...f, paid: !f.paid } : f));
  const toggleDt = (id) => setDebts(debts.map(d => d.id === id ? { ...d, paid: !d.paid } : d));
  const delFx = (id) => setFixedExpenses(fixedExpenses.filter(f => f.id !== id));
  const delDt = (id) => setDebts(debts.filter(d => d.id !== id));

  return (
    <div className="space-y-8">
      {/* Fixed Expenses */}
      <div>
        <SectionHeader title="Despesas Fixas" onAdd={() => setShowFixed(true)} addLabel="Nova Despesa Fixa" />
        {showFixed && (
          <Modal title="Nova Despesa Fixa" onClose={() => setShowFixed(false)}>
            <div className="space-y-3">
              <input className={INPUT} placeholder="Banco / Serviço" value={fxForm.name} onChange={e => setFxForm({ ...fxForm, name: e.target.value })} />
              <input className={INPUT} type="number" placeholder="Valor R$" value={fxForm.value} onChange={e => setFxForm({ ...fxForm, value: e.target.value })} />
              <input className={INPUT} type="number" placeholder="Dia de Vencimento" value={fxForm.dueDay} onChange={e => setFxForm({ ...fxForm, dueDay: e.target.value })} />
              <div className="flex gap-2">
                <input className={INPUT} placeholder="Parcela Atual (ex: 3)" value={fxForm.currentInstall} onChange={e => setFxForm({ ...fxForm, currentInstall: e.target.value })} />
                <input className={INPUT} placeholder="Total (ex: 12)" value={fxForm.totalInstall} onChange={e => setFxForm({ ...fxForm, totalInstall: e.target.value })} />
              </div>
              <button className={BTN} onClick={saveFx}>Salvar</button>
            </div>
          </Modal>
        )}
        <Card>
          {fixedExpenses.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Nenhuma despesa fixa cadastrada</p>
          ) : (
            <div className="space-y-3">
              {fixedExpenses.map(f => (
                <div key={f.id} className={`flex items-center justify-between p-3 rounded-xl border ${f.paid ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleFx(f.id)}>
                      {f.paid ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{f.name}</p>
                      <p className="text-xs text-gray-400">
                        {f.dueDay ? `Vence dia ${f.dueDay}` : ""}
                        {f.currentInstall && f.totalInstall ? ` · Parcela ${f.currentInstall}/${f.totalInstall}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">{fmt(f.value)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {f.paid ? "Pago" : "Pendente"}
                    </span>
                    <button onClick={() => delFx(f.id)} className="text-gray-300 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Debts */}
      <div>
        <SectionHeader title="Dívidas e Parcelamentos" onAdd={() => setShowDebt(true)} addLabel="Nova Dívida" />
        {showDebt && (
          <Modal title="Nova Dívida / Parcelamento" onClose={() => setShowDebt(false)}>
            <div className="space-y-3">
              <input className={INPUT} placeholder="Banco / Credor" value={dtForm.creditor} onChange={e => setDtForm({ ...dtForm, creditor: e.target.value })} />
              <input className={INPUT} type="number" placeholder="Valor Total R$" value={dtForm.total} onChange={e => setDtForm({ ...dtForm, total: e.target.value })} />
              <input className={INPUT} type="date" placeholder="Data" value={dtForm.date} onChange={e => setDtForm({ ...dtForm, date: e.target.value })} />
              <input className={INPUT} type="date" placeholder="Data de Vencimento" value={dtForm.dueDate} onChange={e => setDtForm({ ...dtForm, dueDate: e.target.value })} />
              <div className="flex gap-2">
                <input className={INPUT} placeholder="Parcela Atual" value={dtForm.currentInstall} onChange={e => setDtForm({ ...dtForm, currentInstall: e.target.value })} />
                <input className={INPUT} placeholder="Total Parcelas" value={dtForm.totalInstall} onChange={e => setDtForm({ ...dtForm, totalInstall: e.target.value })} />
              </div>
              <button className={BTN} onClick={saveDt}>Salvar</button>
            </div>
          </Modal>
        )}
        <Card>
          {debts.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Nenhuma dívida cadastrada</p>
          ) : (
            <div className="space-y-3">
              {debts.map(d => (
                <div key={d.id} className={`flex items-center justify-between p-3 rounded-xl border ${d.paid ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleDt(d.id)}>
                      {d.paid ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{d.creditor}</p>
                      <p className="text-xs text-gray-400">
                        {d.date ? `Início: ${d.date}` : ""}
                        {d.dueDate ? ` · Vence: ${d.dueDate}` : ""}
                        {d.currentInstall && d.totalInstall ? ` · Parcela ${d.currentInstall}/${d.totalInstall}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">{fmt(d.total)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.paid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {d.paid ? "Pago" : "Pendente"}
                    </span>
                    <button onClick={() => delDt(d.id)} className="text-gray-300 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── INVESTIMENTOS ────────────────────────────────────────────────────────────
const INVEST_TYPES = ["Renda Fixa", "Ações", "FIIs", "Criptomoedas", "Outros"];
const INVEST_COLORS = { "Renda Fixa": "#10b981", "Ações": "#34d399", "FIIs": "#6ee7b7", "Criptomoedas": "#a7f3d0", "Outros": "#d1fae5" };

function Investimentos({ investments, setInvestments }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ institution: "", name: "", value: "", type: "Renda Fixa", date: today() });

  const save = () => {
    if (!form.name || !form.value) return;
    setInvestments([...investments, { ...form, id: uid(), value: parseFloat(form.value) }]);
    setForm({ institution: "", name: "", value: "", type: "Renda Fixa", date: today() });
    setShowForm(false);
  };

  const del = (id) => setInvestments(investments.filter(i => i.id !== id));

  const total = investments.reduce((a, i) => a + i.value, 0);

  const typeMap = {};
  investments.forEach(i => { typeMap[i.type] = (typeMap[i.type] || 0) + i.value; });
  const donutData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Investimentos" onAdd={() => setShowForm(true)} addLabel="Novo Ativo" />

      {showForm && (
        <Modal title="Novo Ativo" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <input className={INPUT} placeholder="Instituição (ex: XP, Nubank)" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} />
            <input className={INPUT} placeholder="Nome do Ativo (ex: Tesouro Selic)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className={INPUT} type="number" placeholder="Valor R$" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            <select className={SELECT} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {INVEST_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input className={INPUT} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <button className={BTN} onClick={save}>Salvar Ativo</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Investido</p>
          <p className="text-3xl font-bold text-emerald-700">{fmt(total)}</p>
          <p className="text-xs text-gray-400 mt-1">{investments.length} ativo(s) cadastrado(s)</p>
        </Card>
        {donutData.length > 0 && (
          <Card>
            <p className="text-sm font-semibold text-gray-600 mb-2">Alocação de Ativos</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {donutData.map((e, i) => <Cell key={i} fill={INVEST_COLORS[e.name] || "#10b981"} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      <Card>
        {investments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Nenhum investimento cadastrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3 pr-4">Ativo</th>
                  <th className="pb-3 pr-4">Instituição</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Data</th>
                  <th className="pb-3 text-right pr-4">Valor</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-700">{inv.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{inv.institution}</td>
                    <td className="py-3 pr-4">
                      <span style={{ background: INVEST_COLORS[inv.type] || "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{inv.date}</td>
                    <td className="py-3 pr-4 text-right font-bold text-emerald-700">{fmt(inv.value)}</td>
                    <td className="py-3">
                      <button onClick={() => del(inv.id)} className="text-gray-300 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── METAS ────────────────────────────────────────────────────────────────────
function Metas({ goals, setGoals }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", target: "", saved: "" });

  const save = () => {
    if (!form.name || !form.target) return;
    setGoals([...goals, { ...form, id: uid(), target: parseFloat(form.target), saved: parseFloat(form.saved) || 0 }]);
    setForm({ name: "", target: "", saved: "" });
    setShowForm(false);
  };

  const del = (id) => setGoals(goals.filter(g => g.id !== id));

  const addSaved = (id, amount) => {
    setGoals(goals.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g));
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Metas de Economia" onAdd={() => setShowForm(true)} addLabel="Nova Meta" />

      {showForm && (
        <Modal title="Nova Meta de Economia" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <input className={INPUT} placeholder="Nome da Meta (ex: Viagem de Férias)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className={INPUT} type="number" placeholder="Objetivo R$" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
            <input className={INPUT} type="number" placeholder="Já economizado R$ (opcional)" value={form.saved} onChange={e => setForm({ ...form, saved: e.target.value })} />
            <button className={BTN} onClick={save}>Criar Meta</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map(g => {
          const pct = g.target ? Math.min(100, (g.saved / g.target) * 100) : 0;
          return (
            <Card key={g.id} className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">{g.name}</p>
                    <p className="text-xs text-gray-400">{pct.toFixed(0)}% alcançado</p>
                  </div>
                </div>
                <button onClick={() => del(g.id)} className="text-gray-300 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{fmt(g.saved)}</span>
                <span>{fmt(g.target)}</span>
              </div>
              <ProgressBar value={g.saved} max={g.target} color={pct >= 100 ? "#059669" : "#10b981"} />
              {pct < 100 && (
                <div className="mt-3 flex gap-2">
                  {[100, 500, 1000].map(amt => (
                    <button key={amt} onClick={() => addSaved(g.id, amt)}
                      className="flex-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-lg transition-colors">
                      +{fmt(amt)}
                    </button>
                  ))}
                </div>
              )}
              {pct >= 100 && (
                <div className="mt-3 text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-lg">
                  🎉 Meta Alcançada!
                </div>
              )}
            </Card>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-16 text-sm">
            <PiggyBank className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            Nenhuma meta cadastrada ainda
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SIDEBAR NAV ──────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "transactions", label: "Transações", icon: ArrowLeftRight },
  { id: "cards", label: "Cartões", icon: CreditCard },
  { id: "commitments", label: "Compromissos", icon: Landmark },
  { id: "investments", label: "Investimentos", icon: TrendingUp },
  { id: "goals", label: "Metas", icon: Target },
];

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [transactions, setTransactions] = useState(() => STORAGE.get("fx_transactions", []));
  const [cards, setCards] = useState(() => STORAGE.get("fx_cards", []));
  const [fixedExpenses, setFixedExpenses] = useState(() => STORAGE.get("fx_fixed", []));
  const [debts, setDebts] = useState(() => STORAGE.get("fx_debts", []));
  const [investments, setInvestments] = useState(() => STORAGE.get("fx_investments", []));
  const [goals, setGoals] = useState(() => STORAGE.get("fx_goals", []));

  useEffect(() => { STORAGE.set("fx_transactions", transactions); }, [transactions]);
  useEffect(() => { STORAGE.set("fx_cards", cards); }, [cards]);
  useEffect(() => { STORAGE.set("fx_fixed", fixedExpenses); }, [fixedExpenses]);
  useEffect(() => { STORAGE.set("fx_debts", debts); }, [debts]);
  useEffect(() => { STORAGE.set("fx_investments", investments); }, [investments]);
  useEffect(() => { STORAGE.set("fx_goals", goals); }, [goals]);

  const ActiveIcon = NAV.find(n => n.id === tab)?.icon || LayoutDashboard;

  const renderContent = () => {
    switch (tab) {
      case "overview": return <VisaoGeral transactions={transactions} investments={investments} goals={goals} cards={cards} fixedExpenses={fixedExpenses} debts={debts} />;
      case "transactions": return <Transacoes transactions={transactions} setTransactions={setTransactions} />;
      case "cards": return <CreditCards cards={cards} setCards={setCards} />;
      case "commitments": return <Compromissos fixedExpenses={fixedExpenses} setFixedExpenses={setFixedExpenses} debts={debts} setDebts={setDebts} />;
      case "investments": return <Investimentos investments={investments} setInvestments={setInvestments} />;
      case "goals": return <Metas goals={goals} setGoals={setGoals} />;
      default: return null;
    }
  };

  const NavItem = ({ item }) => (
    <button onClick={() => { setTab(item.id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
        ${tab === item.id ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span>{item.label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 p-4 gap-1 fixed h-full z-30">
        <div className="flex items-center gap-3 px-2 py-4 mb-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">FinFlow</p>
            <p className="text-xs text-gray-400">Dashboard Pessoal</p>
          </div>
        </div>
        {NAV.map(n => <NavItem key={n.id} item={n} />)}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-64 bg-white h-full p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 py-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-800">FinFlow</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {NAV.map(n => <NavItem key={n.id} item={n} />)}
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ActiveIcon className="w-4 h-4 text-emerald-600" />
              <h1 className="text-base font-semibold text-gray-800">
                {NAV.find(n => n.id === tab)?.label}
              </h1>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-5 lg:p-8 max-w-6xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
