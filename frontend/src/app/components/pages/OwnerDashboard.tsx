import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  FolderKanban, TrendingUp, TrendingDown, DollarSign, CheckSquare,
  Clock, AlertCircle, ChevronRight, MoreHorizontal, Plus, Loader2
} from "lucide-react";
import { formatCurrency, getStatusBadge } from "../../data/mockData";

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
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [cashflowData, setCashflowData] = useState<any[]>([]);
  const [approvalsData, setApprovalsData] = useState<any[]>([]);
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/projects').then(r => r.json()),
      fetch('http://localhost:5000/api/cashflows').then(r => r.json()),
      fetch('http://localhost:5000/api/purchases').then(r => r.json()),
      fetch('http://localhost:5000/api/activities').then(r => r.json())
    ]).then(([projects, cashflows, purchases, activities]) => {
      setProjectsData(projects);
      
      const formattedCashflows = cashflows.map((d: any) => ({
        ...d,
        income: d.income / 1000000,
        expense: d.expense / 1000000,
        balance: d.balance / 1000000,
      }));
      setCashflowData(formattedCashflows);
      
      const pending = purchases.filter((p: any) => p.status === 'pending-approval').slice(0, 5);
      setApprovalsData(pending);
      setActivitiesData(activities);
    }).catch(err => console.error("Failed to load dashboard data", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-blue-600">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Memuat Dashboard...</p>
      </div>
    );
  }

  const totalContract = projectsData.reduce((s, p) => s + Number(p.contractValue || 0), 0);
  const totalCost = projectsData.reduce((s, p) => s + (Number(p.contractValue || 0) * 0.75), 0); 
  const netProfit = totalContract - totalCost;

  const pieData = [
    { name: "On Track", value: projectsData.filter(p => p.status === 'on-track').length || 0, color: "#16A34A" },
    { name: "At Risk", value: projectsData.filter(p => p.status === 'at-risk').length || 0, color: "#F59E0B" },
    { name: "Delayed", value: projectsData.filter(p => p.status === 'delayed').length || 0, color: "#DC2626" },
    { name: "Completed", value: projectsData.filter(p => p.status === 'completed').length || 0, color: "#2563EB" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Owner Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan perusahaan hari ini</p>
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
        <KpiCard label="Proyek Aktif" value={projectsData.length.toString()} trend="up" trendVal="+3 bulan ini"
          icon={<FolderKanban size={20} className="text-blue-600" />} color="bg-blue-50" />
        <KpiCard label="Total Revenue" value={formatCurrency(totalContract)} trend="up" trendVal="+12% YoY"
          icon={<TrendingUp size={20} className="text-green-600" />} color="bg-green-50" />
        <KpiCard label="Total Expenses" value={formatCurrency(totalCost)} trend="down" trendVal="+5% MoM"
          icon={<TrendingDown size={20} className="text-red-500" />} color="bg-red-50" />
        <KpiCard label="Net Profit" value={formatCurrency(netProfit)} trend="up" trendVal="+8.2% MoM"
          icon={<DollarSign size={20} className="text-purple-600" />} color="bg-purple-50" />
        <KpiCard label="Pending Approval" value={approvalsData.length.toString()} trendVal="Butuh tindakan"
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
              <LineChart data={cashflowData}>
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
              <BarChart data={cashflowData}>
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
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.map((item) => (
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
                {projectsData.slice(0, 5).map((project) => {
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
                      <td className="px-4 py-3 text-xs text-gray-700">{formatCurrency(project.budget || project.contractValue)}</td>
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
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{approvalsData.length} Pending</span>
            </div>
            <div className="divide-y divide-gray-50">
              {approvalsData.length === 0 && <p className="p-5 text-sm text-gray-500 text-center">Tidak ada approval yang tertunda.</p>}
              {approvalsData.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-50`}>
                    <AlertCircle size={14} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900">{item.id}</p>
                      <span className="text-xs text-gray-400">Purchasing</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.material} - {formatCurrency(item.total)}</p>
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
              {activitiesData.length === 0 && <p className="p-5 text-sm text-gray-500 text-center">Belum ada aktivitas hari ini.</p>}
              {activitiesData.map((act, i) => (
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
