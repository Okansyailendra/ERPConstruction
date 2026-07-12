import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Download, Filter, FileText, FileSpreadsheet } from "lucide-react";
import { projects, cashflowData, formatCurrency } from "../../data/mockData";

const REPORT_TYPES = [
  { id: "financial", label: "Laporan Keuangan" },
  { id: "project", label: "Progress Proyek" },
  { id: "purchasing", label: "Pengadaan & Pembelian" },
];

const COLORS = ["#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#8B5CF6"];

export function Reports() {
  const [activeReport, setActiveReport] = useState("financial");
  const [dateRange, setDateRange] = useState("this_year");

  // Format data for financial chart
  const financialData = cashflowData.map((d) => ({
    ...d,
    income: d.income / 1000000,
    expense: d.expense / 1000000,
    profit: (d.income - d.expense) / 1000000,
  }));

  // Format data for project progress chart
  const projectProgressData = projects.map((p) => ({
    name: p.id,
    progress: p.progress,
    fullName: p.name,
  })).slice(0, 10); // Show top 10 projects for clarity

  const projectStatusData = [
    { name: "On Track", value: projects.filter((p) => p.status === "on-track").length },
    { name: "Delayed", value: projects.filter((p) => p.status === "delayed").length },
    { name: "At Risk", value: projects.filter((p) => p.status === "at-risk").length },
    { name: "Completed", value: projects.filter((p) => p.status === "completed").length },
  ];

  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeReport === "financial") {
      csvContent += "Bulan,Pemasukan,Pengeluaran,Saldo Akhir,Profit\n";
      cashflowData.forEach((row) => {
        const profit = row.income - row.expense;
        csvContent += `${row.month},${row.income},${row.expense},${row.balance},${profit}\n`;
      });
    } else if (activeReport === "project") {
      csvContent += "ID Proyek,Nama Proyek,Progress,Status,Budget,Deadline\n";
      projects.forEach((row) => {
        csvContent += `${row.id},"${row.name}",${row.progress}%,${row.status},${row.budget},${row.deadline}\n`;
      });
    } else {
      alert("Tidak ada data untuk diekspor pada laporan ini.");
      return;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_${activeReport}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis dan laporan terpusat</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Filter
          </button>
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
              <FileSpreadsheet size={16} /> Export Excel
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveReport(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeReport === type.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="this_month">Bulan Ini</option>
          <option value="last_month">Bulan Lalu</option>
          <option value="this_quarter">Kuartal Ini</option>
          <option value="this_year">Tahun Ini</option>
          <option value="all_time">Semua Waktu</option>
        </select>
      </div>

      {/* Report Content */}
      {activeReport === "financial" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expense Line Chart */}
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Trend Pemasukan & Pengeluaran</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}Jt`} />
                    <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(1)} Juta`]} />
                    <Legend />
                    <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Net Profit per Bulan</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}Jt`} />
                    <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(1)} Juta`]} cursor={{ fill: '#F9FAFB' }} />
                    <Legend />
                    <Bar dataKey="profit" name="Net Profit" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Rincian Laporan Keuangan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Bulan</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Pemasukan</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Pengeluaran</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Saldo Akhir</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cashflowData.map((d, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{d.month}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatCurrency(d.income)}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatCurrency(d.expense)}</td>
                      <td className="px-5 py-3 text-right text-gray-900 font-medium">{formatCurrency(d.balance)}</td>
                      <td className={`px-5 py-3 text-right font-medium ${(d.income - d.expense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(d.income - d.expense)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === "project" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Status Pie Chart */}
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Distribusi Status Proyek</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Progress Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 lg:col-span-2">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Progress Proyek Berjalan (Top 10)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip cursor={{ fill: '#F9FAFB' }} formatter={(v: number, n: string, props: any) => [`${v}%`, props.payload.fullName]} />
                    <Bar dataKey="progress" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                      {projectProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.progress > 80 ? "#16A34A" : entry.progress < 30 ? "#DC2626" : "#3B82F6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === "purchasing" && (
        <div className="bg-white p-10 rounded-xl border border-gray-200 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Filter size={32} />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Modul Laporan Pengadaan</h2>
            <p className="text-sm text-gray-500">
              Modul analisis mendalam mengenai laporan pengadaan, performa supplier, dan efisiensi pembelian akan segera tersedia di pembaruan selanjutnya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
