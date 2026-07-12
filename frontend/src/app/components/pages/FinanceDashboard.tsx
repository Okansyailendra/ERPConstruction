import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Clock, AlertCircle } from "lucide-react";
import { invoices, cashflowData, formatCurrency, getStatusBadge } from "../../data/mockData";

const EXPENSE_CATEGORIES = [
  { name: "Material", value: 58, color: "#2563EB" },
  { name: "Labor", value: 22, color: "#16A34A" },
  { name: "Equipment", value: 12, color: "#F59E0B" },
  { name: "Operational", value: 8, color: "#8B5CF6" },
];

const RECENT_TRANSACTIONS = [
  { id: "TRX-001", description: "Pembayaran Supplier Holcim", amount: -48_750_000, date: "2024-11-15", category: "Material", project: "PRJ-001" },
  { id: "TRX-002", description: "Terima DP Villa Bali", amount: 1_040_000_000, date: "2024-11-14", category: "Revenue", project: "PRJ-002" },
  { id: "TRX-003", description: "Upah Tenaga Kerja Nov", amount: -285_000_000, date: "2024-11-13", category: "Labor", project: "PRJ-001" },
  { id: "TRX-004", description: "Sewa Crane 30 Hari", amount: -45_000_000, date: "2024-11-12", category: "Equipment", project: "PRJ-003" },
  { id: "TRX-005", description: "Terima Termin 1 Kasablanka", amount: 9_700_000_000, date: "2024-11-10", category: "Revenue", project: "PRJ-003" },
];

function KpiCard({ label, value, sub, icon, color, textColor }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string; textColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        <span className={`text-xs font-medium ${textColor}`}>{sub}</span>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export function FinanceDashboard() {
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");

  const totalIncome = paidInvoices.reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = [...pendingInvoices, ...overdueInvoices].reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Finance Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pemantauan keuangan perusahaan &mdash; Per November 2024</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Income" value={formatCurrency(totalIncome)} sub="+12% MoM"
          icon={<TrendingUp size={18} className="text-green-600" />} color="bg-green-50" textColor="text-green-600" />
        <KpiCard label="Total Expense" value="Rp 8.2M" sub="+5% MoM"
          icon={<TrendingDown size={18} className="text-red-500" />} color="bg-red-50" textColor="text-red-500" />
        <KpiCard label="Current Cash" value="Rp 24.6M" sub="Saldo aktif"
          icon={<DollarSign size={18} className="text-blue-600" />} color="bg-blue-50" textColor="text-blue-600" />
        <KpiCard label="Outstanding Invoice" value={formatCurrency(totalOutstanding)} sub={`${pendingInvoices.length + overdueInvoices.length} invoice`}
          icon={<CreditCard size={18} className="text-amber-500" />} color="bg-amber-50" textColor="text-amber-600" />
        <KpiCard label="Upcoming Payment" value="Rp 3.2M" sub="Jatuh tempo 7 hari"
          icon={<Clock size={18} className="text-purple-600" />} color="bg-purple-50" textColor="text-purple-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-4">
        {/* Cashflow Area Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Cashflow 7 Bulan Terakhir</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashflowData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}B`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v * 1000)]} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#2563EB" fill="url(#incomeGrad)" strokeWidth={2} name="Pemasukan" />
              <Area type="monotone" dataKey="expense" stroke="#DC2626" fill="url(#expenseGrad)" strokeWidth={2} name="Pengeluaran" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Category */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Expense by Category</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={EXPENSE_CATEGORIES} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                {EXPENSE_CATEGORIES.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {EXPENSE_CATEGORIES.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Status Table + Recent Transactions */}
      <div className="grid grid-cols-12 gap-4">
        {/* Invoice Table */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Invoice Status</h2>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{paidInvoices.length} Paid</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{pendingInvoices.length} Pending</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{overdueInvoices.length} Overdue</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Invoice ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Proyek</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nominal</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Jatuh Tempo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  return (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-xs font-medium text-blue-600">{inv.id}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[140px] truncate">{inv.project}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Transaksi Terbaru</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_TRANSACTIONS.map((trx) => (
              <div key={trx.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  trx.amount > 0 ? "bg-green-50" : "bg-red-50"
                }`}>
                  {trx.amount > 0
                    ? <TrendingUp size={15} className="text-green-600" />
                    : <TrendingDown size={15} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{trx.description}</p>
                  <p className="text-xs text-gray-400">{trx.date} &middot; {trx.category}</p>
                </div>
                <span className={`text-xs font-semibold flex-shrink-0 ${trx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {trx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(trx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
