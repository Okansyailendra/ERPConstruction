import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

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

const CATEGORY_COLORS = ["#2563EB", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899"];

export function Cashflow() {
  const [cashflows, setCashflows] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/cashflows')
      .then(res => res.json())
      .then(data => setCashflows(data))
      .catch(err => console.error(err));
  }, []);

  const processedData = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    const monthlyMap: Record<string, { income: number, expense: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    months.forEach(m => monthlyMap[m] = { income: 0, expense: 0 });

    const txs: any[] = [];

    cashflows.forEach(c => {
      const amt = Number(c.amount);
      const isIncome = c.type === 'INCOME';
      
      if (isIncome) totalIncome += amt;
      else totalExpense += amt;

      const d = new Date(c.transaction_date);
      const mName = months[d.getMonth()];
      
      if (mName && monthlyMap[mName]) {
        if (isIncome) monthlyMap[mName].income += amt;
        else monthlyMap[mName].expense += amt;
      }

      txs.push({
        id: c.uuid || c.id,
        desc: c.description,
        amount: isIncome ? amt : -amt,
        type: isIncome ? 'in' : 'out',
        date: d.toISOString().split('T')[0],
        cat: c.reference_type || 'Operasional'
      });
    });

    let cumulativeBalance = 0;
    const monthlyTrend = months.map(month => {
      const inc = (monthlyMap[month]?.income || 0) / 1000000;
      const exp = (monthlyMap[month]?.expense || 0) / 1000000;
      cumulativeBalance += (inc - exp);
      return { month, income: inc, expense: exp, balance: cumulativeBalance };
    });

    return {
      totalIncome,
      totalExpense,
      netCash: totalIncome - totalExpense,
      monthlyTrend,
      transactions: txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
    };
  }, [cashflows]);

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Cashflow Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pemantauan arus kas perusahaan</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Pemasukan" value={formatCurrency(processedData.totalIncome)} sub=""
          icon={<TrendingUp size={18} className="text-green-600" />} color="bg-green-50" textColor="text-green-600" />
        <KpiCard label="Total Pengeluaran" value={formatCurrency(processedData.totalExpense)} sub=""
          icon={<TrendingDown size={18} className="text-red-500" />} color="bg-red-50" textColor="text-red-500" />
        <KpiCard label="Net Cashflow" value={formatCurrency(processedData.netCash)} sub=""
          icon={<DollarSign size={18} className="text-blue-600" />} color="bg-blue-50" textColor="text-blue-600" />
        <KpiCard label="Total Transaksi" value={cashflows.length.toString()} sub="Tercatat"
          icon={<CreditCard size={18} className="text-purple-600" />} color="bg-purple-50" textColor="text-purple-600" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Cashflow Trend (Juta Rp)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={processedData.monthlyTrend}>
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
              <Tooltip formatter={(v: number) => [`Rp ${v.toFixed(1)}jt`]} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#2563EB" fill="url(#cfIncome)" strokeWidth={2} name="Pemasukan" />
              <Area type="monotone" dataKey="expense" stroke="#DC2626" fill="url(#cfExpense)" strokeWidth={2} name="Pengeluaran" />
              <Line type="monotone" dataKey="balance" stroke="#16A34A" strokeWidth={2} dot={false} name="Saldo" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction History */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-gray-200 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">Riwayat Transaksi Terakhir</h2>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[240px]">
            {processedData.transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Belum ada transaksi</div>
            ) : processedData.transactions.map((trx) => (
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
