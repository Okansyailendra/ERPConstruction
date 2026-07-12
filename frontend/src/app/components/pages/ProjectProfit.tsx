import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { projects, formatCurrency, getStatusBadge } from "../../data/mockData";

const PROFIT_TREND = [
  { month: "Jan", profit: 850 },
  { month: "Feb", profit: 1200 },
  { month: "Mar", profit: 980 },
  { month: "Apr", profit: 1450 },
  { month: "Mei", profit: 1100 },
  { month: "Jun", profit: 1800 },
  { month: "Jul", profit: 1650 },
  { month: "Agu", profit: 2100 },
  { month: "Sep", profit: 1950 },
  { month: "Okt", profit: 2400 },
  { month: "Nov", profit: 2200 },
];

const PROJECT_RANKING = projects.map((p) => {
  const totalCost = p.materialCost + p.laborCost + p.equipmentCost + p.operationalCost;
  const profit = p.contractValue - totalCost;
  const margin = ((profit / p.contractValue) * 100).toFixed(1);
  return { ...p, totalCost, profit, margin: parseFloat(margin) };
}).sort((a, b) => b.profit - a.profit);

const TOTAL_CONTRACT = projects.reduce((s, p) => s + p.contractValue, 0);
const TOTAL_MATERIAL = projects.reduce((s, p) => s + p.materialCost, 0);
const TOTAL_LABOR = projects.reduce((s, p) => s + p.laborCost, 0);
const TOTAL_EQUIPMENT = projects.reduce((s, p) => s + p.equipmentCost, 0);
const TOTAL_OPERATIONAL = projects.reduce((s, p) => s + p.operationalCost, 0);
const TOTAL_COST = TOTAL_MATERIAL + TOTAL_LABOR + TOTAL_EQUIPMENT + TOTAL_OPERATIONAL;
const NET_PROFIT = TOTAL_CONTRACT - TOTAL_COST;
const MARGIN = ((NET_PROFIT / TOTAL_CONTRACT) * 100).toFixed(1);

const COST_PIE = [
  { name: "Material", value: TOTAL_MATERIAL, color: "#2563EB" },
  { name: "Labor", value: TOTAL_LABOR, color: "#16A34A" },
  { name: "Equipment", value: TOTAL_EQUIPMENT, color: "#F59E0B" },
  { name: "Operational", value: TOTAL_OPERATIONAL, color: "#8B5CF6" },
];

function MetricCard({ label, value, sub, icon, color, textColor }: any) {
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

export function ProjectProfit() {
  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Project Profit Analysis</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analisis profitabilitas seluruh proyek perusahaan</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Nilai Kontrak Total" value={formatCurrency(TOTAL_CONTRACT)} sub="+12% YoY"
          icon={<DollarSign size={18} className="text-blue-600" />} color="bg-blue-50" textColor="text-blue-600" />
        <MetricCard label="Net Profit" value={formatCurrency(NET_PROFIT)} sub="+18% YoY"
          icon={<TrendingUp size={18} className="text-green-600" />} color="bg-green-50" textColor="text-green-600" />
        <MetricCard label="Total Cost" value={formatCurrency(TOTAL_COST)} sub="+9% YoY"
          icon={<TrendingDown size={18} className="text-red-500" />} color="bg-red-50" textColor="text-red-500" />
        <MetricCard label="Profit Margin" value={`${MARGIN}%`} sub="Seluruh proyek"
          icon={<Percent size={18} className="text-purple-600" />} color="bg-purple-50" textColor="text-purple-600" />
      </div>

      {/* Cost Breakdown Detail Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Material Cost", value: TOTAL_MATERIAL, pct: ((TOTAL_MATERIAL / TOTAL_COST) * 100).toFixed(0), color: "bg-blue-500" },
          { label: "Labor Cost", value: TOTAL_LABOR, pct: ((TOTAL_LABOR / TOTAL_COST) * 100).toFixed(0), color: "bg-green-500" },
          { label: "Equipment Cost", value: TOTAL_EQUIPMENT, pct: ((TOTAL_EQUIPMENT / TOTAL_COST) * 100).toFixed(0), color: "bg-amber-400" },
          { label: "Operational Cost", value: TOTAL_OPERATIONAL, pct: ((TOTAL_OPERATIONAL / TOTAL_COST) * 100).toFixed(0), color: "bg-purple-400" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2">{item.label}</p>
            <p className="text-base font-semibold text-gray-900">{formatCurrency(item.value)}</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{item.pct}% dari total cost</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-4">
        {/* Profit Trend */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Profit Trend 2024 (Juta Rp)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={PROFIT_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
              <Tooltip formatter={(v: number) => [`Rp ${v}jt`]} />
              <Line type="monotone" dataKey="profit" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 3 }} name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Distribution */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Distribusi Biaya</h2>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={COST_PIE} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {COST_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [formatCurrency(v)]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {COST_PIE.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="text-gray-700 font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Ranking */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Project Profit Ranking</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Proyek</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Nilai Kontrak</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Cost</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Net Profit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Margin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {PROJECT_RANKING.map((p, i) => {
                const badge = getStatusBadge(p.status);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-yellow-100 text-yellow-700" :
                        i === 1 ? "bg-gray-100 text-gray-600" :
                        i === 2 ? "bg-amber-100 text-amber-700" : "bg-gray-50 text-gray-400"
                      }`}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 max-w-[200px] leading-snug">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.id}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(p.contractValue)}</td>
                    <td className="px-4 py-3 text-right text-sm text-red-600">{formatCurrency(p.totalCost)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">{formatCurrency(p.profit)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold ${p.margin >= 20 ? "text-green-600" : p.margin >= 10 ? "text-blue-600" : "text-amber-500"}`}>
                        {p.margin}%
                      </span>
                    </td>
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
    </div>
  );
}
