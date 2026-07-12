import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  FolderKanban, TrendingUp, TrendingDown, DollarSign, CheckSquare,
  Clock, AlertCircle, ChevronRight, MoreHorizontal, Plus,
} from "lucide-react";
import { projects, invoices, cashflowData, formatCurrency, getStatusBadge } from "../../data/mockData";

const CASHFLOW_DATA = cashflowData.map((d) => ({
  ...d,
  income: d.income / 1000,
  expense: d.expense / 1000,
  balance: d.balance / 1000,
}));

const PIE_DATA = [
  { name: "On Track", value: 2, color: "#16A34A" },
  { name: "At Risk", value: 1, color: "#F59E0B" },
  { name: "Delayed", value: 1, color: "#DC2626" },
  { name: "Completed", value: 1, color: "#2563EB" },
];

const ACTIVITIES = [
  { time: "09:15", event: "Invoice INV-2024-003 diterima oleh PT. Lippo Mall", type: "info" },
  { time: "10:30", event: "Purchase Request PR-2024-004 menunggu approval Finance", type: "warning" },
  { time: "11:00", event: "Progress foto PRJ-001 diupload oleh Mandor Agus", type: "success" },
  { time: "13:45", event: "Material Beton K-300 diterima di site PRJ-001", type: "success" },
  { time: "15:20", event: "Deadline PRJ-004 warning: tersisa 45 hari", type: "warning" },
];

const APPROVALS = [
  { id: "PR-2024-004", type: "Purchase Request", desc: "Semen Portland 200 sak - Rp 14.3jt", urgency: "normal", requestBy: "Hendra W." },
  { id: "PR-2024-002", type: "Purchase Request", desc: "Besi Beton D13 2000kg - Rp 28jt", urgency: "urgent", requestBy: "Hendra W." },
  { id: "INV-2024-005", type: "Invoice Approval", desc: "INV-2024-005 Rp 6.4M - Termin 80%", urgency: "normal", requestBy: "Dewi R." },
];

function KpiCard({ label, value, trend, trendVal, icon, color }: {
  label: string; value: string; trend?: "up" | "down"; trendVal?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trendVal && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendVal}
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"cashflow" | "revenue">("cashflow");

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalContract = projects.reduce((s, p) => s + p.contractValue, 0);
  const totalCost = projects.reduce((s, p) => s + p.materialCost + p.laborCost + p.equipmentCost + p.operationalCost, 0);
  const netProfit = totalContract - totalCost;

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Owner Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Senin, 6 Juli 2026 &mdash; Ringkasan perusahaan hari ini</p>
        </div>
        <button
          onClick={() => navigate("/projects/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Proyek Baru
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Proyek Aktif" value="24" trend="up" trendVal="+3 bulan ini"
          icon={<FolderKanban size={20} className="text-blue-600" />} color="bg-blue-50" />
        <KpiCard label="Total Revenue" value={formatCurrency(totalContract)} trend="up" trendVal="+12% YoY"
          icon={<TrendingUp size={20} className="text-green-600" />} color="bg-green-50" />
        <KpiCard label="Total Expenses" value={formatCurrency(totalCost)} trend="down" trendVal="+5% MoM"
          icon={<TrendingDown size={20} className="text-red-500" />} color="bg-red-50" />
        <KpiCard label="Net Profit" value={formatCurrency(netProfit)} trend="up" trendVal="+8.2% MoM"
          icon={<DollarSign size={20} className="text-purple-600" />} color="bg-purple-50" />
        <KpiCard label="Pending Approval" value="3" trendVal="Butuh tindakan"
          icon={<CheckSquare size={20} className="text-amber-500" />} color="bg-amber-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Cashflow Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Financial Overview</h2>
            <div className="flex gap-1">
              {(["cashflow", "revenue"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab === "cashflow" ? "Cashflow" : "Revenue"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {activeTab === "cashflow" ? (
              <LineChart data={CASHFLOW_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                <Tooltip formatter={(v: number) => [`Rp ${v.toFixed(1)}M`]} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2} dot={false} name="Pemasukan" />
                <Line type="monotone" dataKey="expense" stroke="#DC2626" strokeWidth={2} dot={false} name="Pengeluaran" />
                <Line type="monotone" dataKey="balance" stroke="#16A34A" strokeWidth={2} dot={false} name="Saldo" />
              </LineChart>
            ) : (
              <BarChart data={CASHFLOW_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                <Tooltip formatter={(v: number) => [`Rp ${v.toFixed(1)}M`]} />
                <Legend />
                <Bar dataKey="income" fill="#2563EB" name="Revenue" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#E5E7EB" name="Expense" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Project Status Pie */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Status Proyek</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {PIE_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Project Summary Table */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Ringkasan Proyek</h2>
            <button onClick={() => navigate("/projects")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat Semua <ChevronRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Proyek</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Deadline</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const badge = getStatusBadge(project.status);
                  return (
                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-xs leading-snug max-w-[180px] truncate">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-8">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{formatCurrency(project.budget)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{project.deadline}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Approvals + Activities */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Approval Center */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Approval Center</h2>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{APPROVALS.length} Pending</span>
            </div>
            <div className="divide-y divide-gray-50">
              {APPROVALS.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.urgency === "urgent" ? "bg-red-50" : "bg-amber-50"
                  }`}>
                    <AlertCircle size={14} className={item.urgency === "urgent" ? "text-red-500" : "text-amber-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900">{item.id}</p>
                      <span className="text-xs text-gray-400">{item.requestBy}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg hover:bg-green-100">✓</button>
                    <button className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Aktivitas Hari Ini</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {ACTIVITIES.map((act, i) => (
                <div key={i} className="px-5 py-3 flex gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    act.type === "success" ? "bg-green-500" :
                    act.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 leading-snug">{act.event}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
