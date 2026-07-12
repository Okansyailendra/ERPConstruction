import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FolderKanban, Calendar, CheckSquare, Package, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { projects, formatCurrency, getStatusBadge } from "../../data/mockData";

const TASKS = [
  { id: 1, task: "Pengecoran kolom lantai 8 - Tower A", project: "PRJ-001", priority: "high", status: "in-progress", assignee: "Agus S." },
  { id: 2, task: "Inspeksi pembesian balok induk", project: "PRJ-001", priority: "high", status: "pending", assignee: "Agus S." },
  { id: 3, task: "Review shop drawing MEP", project: "PRJ-003", priority: "normal", status: "in-progress", assignee: "Tim MEP" },
  { id: 4, task: "Approval material keramik", project: "PRJ-002", priority: "normal", status: "pending", assignee: "Andi P." },
  { id: 5, task: "Update laporan harian", project: "PRJ-001", priority: "low", status: "completed", assignee: "Budi S." },
];

const GANTT_DATA = [
  { phase: "Persiapan", start: 0, duration: 10, project: "PRJ-001" },
  { phase: "Pondasi", start: 10, duration: 20, project: "PRJ-001" },
  { phase: "Struktur", start: 30, duration: 40, project: "PRJ-001" },
  { phase: "Finishing", start: 70, duration: 30, project: "PRJ-001" },
];

const MATERIAL_NEEDS = [
  { material: "Beton K-300", needed: 80, available: 45, unit: "m³" },
  { material: "Besi D13", needed: 3500, available: 2800, unit: "kg" },
  { material: "Keramik 60x60", needed: 450, available: 0, unit: "m²" },
  { material: "Cat Eksterior", needed: 200, available: 120, unit: "ltr" },
];

const PROGRESS_DATA = projects.map((p) => ({ name: p.id, progress: p.progress }));

export function ProjectManagerDashboard() {
  const onTrack = projects.filter((p) => p.status === "on-track").length;
  const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Project Manager Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview semua proyek yang dikelola</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Running Projects", value: projects.length, sub: `${onTrack} on track`, icon: <FolderKanban size={18} className="text-blue-600" />, color: "bg-blue-50" },
          { label: "Avg. Progress", value: `${avgProgress}%`, sub: "Seluruh proyek", icon: <TrendingUp size={18} className="text-green-600" />, color: "bg-green-50" },
          { label: "Upcoming Deadlines", value: "3", sub: "Dalam 30 hari", icon: <AlertTriangle size={18} className="text-amber-500" />, color: "bg-amber-50" },
          { label: "Today's Tasks", value: TASKS.filter(t => t.status !== "completed").length, sub: "Belum selesai", icon: <CheckSquare size={18} className="text-purple-600" />, color: "bg-purple-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>{kpi.icon}</div>
            <p className="text-xl font-semibold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-blue-600 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Project Cards + Tasks */}
      <div className="grid grid-cols-12 gap-4">
        {/* Project Cards */}
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Proyek Aktif</h2>
          {projects.map((project) => {
            const badge = getStatusBadge(project.status);
            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{project.id} &middot; PM: {project.pm} &middot; {project.location}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badge.color}`}>{badge.label}</span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        project.progress >= 80 ? "bg-green-500" :
                        project.progress >= 50 ? "bg-blue-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Budget: {formatCurrency(project.budget)}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> Deadline: {project.deadline}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Tasks + Materials */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Today's Tasks */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Tugas Hari Ini</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {TASKS.map((task) => (
                <div key={task.id} className="px-4 py-3 flex gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    task.priority === "high" ? "bg-red-500" :
                    task.priority === "normal" ? "bg-amber-400" : "bg-gray-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-snug">{task.task}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{task.project} &middot; {task.assignee}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    task.status === "completed" ? "bg-green-100 text-green-700" :
                    task.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {task.status === "completed" ? "Done" : task.status === "in-progress" ? "Active" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Material Needs */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Package size={15} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Kebutuhan Material</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {MATERIAL_NEEDS.map((m) => {
                const ratio = m.available / m.needed;
                return (
                  <div key={m.material} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-800">{m.material}</p>
                      <p className="text-xs text-gray-500">{m.available}/{m.needed} {m.unit}</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${ratio >= 0.6 ? "bg-green-500" : ratio > 0 ? "bg-amber-400" : "bg-red-500"}`}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Gantt-style Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Project Timeline — PRJ-001 Gedung Sudirman</h2>
        <div className="space-y-3">
          {GANTT_DATA.map((item) => (
            <div key={item.phase} className="flex items-center gap-4">
              <div className="w-24 text-xs text-gray-600 flex-shrink-0">{item.phase}</div>
              <div className="flex-1 relative h-6 bg-gray-100 rounded">
                <div
                  className="absolute h-full bg-blue-500 rounded flex items-center px-2"
                  style={{ left: `${item.start}%`, width: `${item.duration}%` }}
                >
                  <span className="text-white text-xs whitespace-nowrap">{item.duration}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>Jan 2024</span>
          <span>Apr 2024</span>
          <span>Jul 2024</span>
          <span>Okt 2024</span>
          <span>Jan 2025</span>
        </div>
      </div>
    </div>
  );
}
