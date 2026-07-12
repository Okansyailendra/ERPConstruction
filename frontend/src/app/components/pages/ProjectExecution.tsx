import { useState } from "react";
import { Camera, Upload, CheckSquare, Package, Users, Wrench, Clock, ChevronDown, ChevronUp, Check } from "lucide-react";
import { projects, getStatusBadge } from "../../data/mockData";

const MILESTONES = [
  { label: "Fondasi Selesai", date: "2024-02-28", done: true },
  { label: "Struktur Lantai 1-4", date: "2024-05-15", done: true },
  { label: "Struktur Lantai 5-8", date: "2024-08-30", done: true },
  { label: "Struktur Lantai 9-12", date: "2024-11-30", done: false },
  { label: "MEP & Finishing", date: "2025-02-28", done: false },
  { label: "Serah Terima", date: "2025-03-30", done: false },
];

const TASKS = [
  { id: 1, task: "Pengecoran kolom lantai 8", category: "Struktur", assignee: "Agus S.", status: "in-progress", progress: 60 },
  { id: 2, task: "Pemasangan besi lantai 9", category: "Struktur", assignee: "Tim B", status: "pending", progress: 0 },
  { id: 3, task: "Pemasangan pipa HVAC lantai 5", category: "MEP", assignee: "Tim MEP", status: "in-progress", progress: 35 },
  { id: 4, task: "Finishing dinding lantai 3", category: "Finishing", assignee: "Tim C", status: "completed", progress: 100 },
  { id: 5, task: "Inspeksi pondasi", category: "QA/QC", assignee: "Budi S.", status: "completed", progress: 100 },
];

const MATERIALS = [
  { name: "Beton K-300", used: "185 m³", plan: "230 m³", pct: 80 },
  { name: "Besi Beton D13", used: "6,200 kg", plan: "8,500 kg", pct: 73 },
  { name: "Semen Portland", used: "820 sak", plan: "1,200 sak", pct: 68 },
  { name: "Bekisting Plywood", used: "380 lembar", plan: "500 lembar", pct: 76 },
];

const LABOR = [
  { role: "Tukang Beton", today: 12, plan: 15 },
  { role: "Tukang Besi", today: 8, plan: 10 },
  { role: "Tukang MEP", today: 5, plan: 5 },
  { role: "Pekerja Umum", today: 25, plan: 30 },
];

const PHOTOS = [
  { id: 1, title: "Pengecoran Kolom K-8A", date: "06 Jul 2026", area: "Lantai 8" },
  { id: 2, title: "Pembesian Sloof", date: "05 Jul 2026", area: "Lantai 7" },
  { id: 3, title: "Progress Dinding Lantai 3", date: "04 Jul 2026", area: "Lantai 3" },
  { id: 4, title: "Area Scaffolding", date: "03 Jul 2026", area: "Eksterior" },
  { id: 5, title: "Instalasi Pipa HVAC", date: "02 Jul 2026", area: "Lantai 5" },
  { id: 6, title: "Keramik Lobby Lt.1", date: "01 Jul 2026", area: "Lantai 1" },
];

const project = projects[0];

export function ProjectExecution() {
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const badge = getStatusBadge(project.status);

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Project Execution</h1>
          <p className="text-sm text-gray-500 mt-0.5">{project.name} — {project.id}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Upload size={16} /> Upload Progress
        </button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#2563EB" strokeWidth="10"
                    strokeDasharray={`${project.progress * 2.51} 251`} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{project.progress}%</span>
                  <span className="text-xs text-gray-400">Done</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.name}</p>
                <p className="text-xs text-gray-500 mt-1">PM: {project.pm}</p>
                <p className="text-xs text-gray-500">{project.location}</p>
                <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Start Date", value: project.startDate },
                { label: "Deadline", value: project.deadline },
                { label: "Lantai", value: `${project.floors} Lantai` },
                { label: "Luas", value: `${project.area.toLocaleString()} m²` },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-700">Overall Progress</p>
                <p className="text-xs text-gray-500">{project.progress}%</p>
              </div>
              <div className="h-3 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Timeline & Milestones</h2>
        <div className="flex items-center overflow-x-auto pb-2">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center min-w-[120px]">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  m.done ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"
                }`}>
                  {m.done ? <Check size={14} className="text-white" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                </div>
                <p className={`text-xs text-center mt-1 leading-tight ${m.done ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {m.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{m.date}</p>
              </div>
              {i < MILESTONES.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 flex-shrink-0 ${m.done ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Tasks */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <CheckSquare size={15} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Today's Tasks</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {TASKS.map((task) => (
              <div key={task.id} className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === "completed" ? "bg-green-500" :
                    task.status === "in-progress" ? "bg-blue-500" : "bg-gray-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{task.task}</p>
                    <p className="text-xs text-gray-400">{task.category} &middot; {task.assignee}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    task.status === "completed" ? "bg-green-100 text-green-700" :
                    task.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {task.status === "in-progress" ? "Active" : task.status === "completed" ? "Done" : "Pending"}
                  </span>
                </div>
                {task.status !== "pending" && (
                  <div className="ml-5 mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-600">{task.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${task.status === "completed" ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Labor + Materials */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Material Used */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Package size={15} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Material Digunakan</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {MATERIALS.map((m) => (
                <div key={m.name} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.used} / {m.plan}</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Labor */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Users size={15} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Aktivitas Tenaga Kerja</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {LABOR.map((l) => (
                <div key={l.role} className="px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-gray-700">{l.role}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{l.today}</span>
                    <span className="text-xs text-gray-400">/ {l.plan}</span>
                    <span className="text-xs text-gray-400">orang</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera size={15} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Foto Progress</h2>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
            <Upload size={13} /> Upload Foto
          </button>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {PHOTOS.map((photo) => (
            <div key={photo.id} className="group cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors relative overflow-hidden">
                <Camera size={24} className="text-gray-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate">{photo.title}</p>
              <p className="text-xs text-gray-400">{photo.area}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
