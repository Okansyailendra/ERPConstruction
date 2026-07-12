import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";
import { cashflowData, formatCurrency } from "../../data/mockData";

const MONTHLY_TREND = [
  { month: "Jan", income: 5200, expense: 3800, balance: 1400 },
  { month: "Feb", income: 6800, expense: 4200, balance: 2600 },
  { month: "Mar", income: 8500, expense: 5100, balance: 3400 },
  { month: "Apr", income: 7200, expense: 4800, balance: 2400 },
  { month: "Mei", income: 9800, expense: 6200, balance: 3600 },
  { month: "Jun", income: 8500, expense: 5200, balance: 3300 },
  { month: "Jul", income: 12200, expense: 7800, balance: 4400 },
  { month: "Agu", income: 9800, expense: 6500, balance: 3300 },
  { month: "Sep", income: 15600, expense: 9200, balance: 6400 },
  { month: "Okt", income: 18900, expense: 11500, balance: 7400 },
  { month: "Nov", income: 14200, expense: 8800, balance: 5400 },
  { month: "Des", income: 22500, expense: 13200, balance: 9300 },
];

const PROJECT_CASHFLOW = [
  { project: "PRJ-001", income: 7200, expense: 3800 },
  { project: "PRJ-002", income: 2080, expense: 950 },
  { project: "PRJ-003", income: 9700, expense: 5200 },
  { project: "PRJ-004", income: 3920, expense: 2100 },
  { project: "PRJ-005", income: 6400, expense: 3200 },
];

const CATEGORY_PIE = [
  { name: "Operasional", value: 35, color: "#2563EB" },
  { name: "Material", value: 40, color: "#16A34A" },
  { name: "Labor", value: 18, color: "#F59E0B" },
  { name: "Equipment", value: 7, color: "#8B5CF6" },
];

const TRANSACTIONS = [
  { id: "TRX-101", desc: "Terima Termin 1 Kasablanka", amount: 9_700_000_000, type: "in", date: "2024-11-10", cat: "Revenue" },
  { id: "TRX-102", desc: "Bayar Supplier Holcim", amount: -48_750_000, type: "out", date: "2024-11-09", cat: "Material" },
  { id: "TRX-103", desc: "Upah Tukang Bulan Nov", amount: -285_000_000, type: "out", date: "2024-11-08", cat: "Labor" },
  { id: "TRX-104", desc: "Terima DP Villa Bali", amount: 1_040_000_000, type: "in", date: "2024-11-07", cat: "Revenue" },
  { id: "TRX-105", desc: "Sewa Alat Berat", amount: -45_000_000, type: "out", date: "2024-11-06", cat: "Equipment" },
  { id: "TRX-106", desc: "Biaya Operasional Kantor", amount: -12_500_000, type: "out", date: "2024-11-05", cat: "Operasional" },
];

function KpiCard({ label, value, sub, icon, color, textColor }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        <span className={`text-xs ${textColor}`}>{sub}</span>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export function Cashflow() {
  const totalIncome = MONTHLY_TREND.reduce((s, m) => s + m.income, 0);
  const totalExpense = MONTHLY_TREND.reduce((s, m) => s + m.expense, 0);
  const netCash = totalIncome - totalExpense;

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Cashflow Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pemantauan arus kas perusahaan &mdash; 2024</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Pemasukan" value={`Rp ${(totalIncome).toFixed(0)}jt`} sub="+15% YoY"
          icon={<TrendingUp size={18} className="text-green-600" />} color="bg-green-50" textColor="text-green-600" />
        <KpiCard label="Total Pengeluaran" value={`Rp ${(totalExpense).toFixed(0)}jt`} sub="+8% YoY"
          icon={<TrendingDown size={18} className="text-red-500" />} color="bg-red-50" textColor="text-red-500" />
        <KpiCard label="Net Cashflow" value={`Rp ${(netCash).toFixed(0)}jt`} sub="+22% YoY"
          icon={<DollarSign size={18} className="text-blue-600" />} color="bg-blue-50" textColor="text-blue-600" />
        <KpiCard label="Saldo Akhir" value="Rp 24.6M" sub="Per Nov 2024"
          icon={<CreditCard size={18} className="text-purple-600" />} color="bg-purple-50" textColor="text-purple-600" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Cashflow Trend (Juta Rp)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="cfIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cfExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
              <Tooltip formatter={(v: number) => [`Rp ${v}jt`]} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#2563EB" fill="url(#cfIncome)" strokeWidth={2} name="Pemasukan" />
              <Area type="monotone" dataKey="expense" stroke="#DC2626" fill="url(#cfExpense)" strokeWidth={2} name="Pengeluaran" />
              <Line type="monotone" dataKey="balance" stroke="#16A34A" strokeWidth={2} dot={false} name="Saldo" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Kategori Pengeluaran</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={CATEGORY_PIE} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                {CATEGORY_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {CATEGORY_PIE.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Project Cashflow */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Cashflow Per Proyek (Juta Rp)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PROJECT_CASHFLOW}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="project" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
              <Tooltip formatter={(v: number) => [`Rp ${v}jt`]} />
              <Legend />
              <Bar dataKey="income" fill="#2563EB" name="Pemasukan" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" fill="#E5E7EB" name="Pengeluaran" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction History */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Riwayat Transaksi</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {TRANSACTIONS.map((trx) => (
              <div key={trx.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  trx.type === "in" ? "bg-green-50" : "bg-red-50"
                }`}>
                  {trx.type === "in"
                    ? <TrendingUp size={15} className="text-green-600" />
                    : <TrendingDown size={15} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{trx.desc}</p>
                  <p className="text-xs text-gray-400">{trx.date} &middot; {trx.cat}</p>
                </div>
                <span className={`text-xs font-semibold flex-shrink-0 ${trx.type === "in" ? "text-green-600" : "text-red-600"}`}>
                  {trx.type === "in" ? "+" : ""}{formatCurrency(Math.abs(trx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
