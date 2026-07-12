import { useState } from "react";
import { CheckSquare, Camera, Package, Clock, ChevronRight, Plus, Check, AlertCircle } from "lucide-react";

const CHECKLIST = [
  { id: 1, item: "Briefing tim pagi hari", done: true, time: "07:30" },
  { id: 2, item: "Pemeriksaan APD seluruh pekerja", done: true, time: "07:45" },
  { id: 3, item: "Persiapan area pengecoran kolom K-8A", done: true, time: "08:00" },
  { id: 4, item: "Pengecoran kolom lantai 8 sektor A", done: false, time: "09:00" },
  { id: 5, item: "Inspeksi hasil pengecoran", done: false, time: "11:00" },
  { id: 6, item: "Pemasangan bekisting kolom K-8B", done: false, time: "13:00" },
  { id: 7, item: "Upload foto progress harian", done: false, time: "16:00" },
  { id: 8, item: "Laporan harian mandor", done: false, time: "17:00" },
];

const SCHEDULE = [
  { time: "07:30 - 08:00", activity: "Briefing & Safety Check", status: "done" },
  { time: "08:00 - 11:00", activity: "Pengecoran Kolom Lantai 8 - Sektor A", status: "active" },
  { time: "11:00 - 12:00", activity: "ISHOMA", status: "upcoming" },
  { time: "13:00 - 16:00", activity: "Pemasangan Bekisting Kolom K-8B", status: "upcoming" },
  { time: "16:00 - 17:00", activity: "Dokumentasi & Laporan Harian", status: "upcoming" },
];

const PROGRESS_PHOTOS = [
  { id: 1, title: "Pengecoran Kolom K-7A", time: "08:45", status: "submitted" },
  { id: 2, title: "Area Scaffolding Lantai 7", time: "09:20", status: "submitted" },
  { id: 3, title: "Material Besi Tiba", time: "10:15", status: "pending" },
];

export function MandorDashboard() {
  const [checklist, setChecklist] = useState(CHECKLIST);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const doneCount = checklist.filter((c) => c.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  const toggleItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Proyek Saat Ini</p>
            <h1 className="text-lg font-semibold text-gray-900 mt-0.5">Gedung Perkantoran Sudirman</h1>
            <p className="text-sm text-gray-500">PRJ-001 &middot; Lantai 8 &middot; Senin, 6 Juli 2026</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{progress}%</p>
            <p className="text-xs text-gray-500">Progress Hari Ini</p>
          </div>
        </div>
        <div className="mt-4 h-3 bg-gray-100 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{doneCount} dari {checklist.length} tugas selesai</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center gap-2 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Camera size={24} />
          <span className="text-sm font-medium">Upload Foto</span>
        </button>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex flex-col items-center gap-2 p-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
        >
          <Package size={24} />
          <span className="text-sm font-medium">Minta Material</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
          <Check size={24} />
          <span className="text-sm font-medium">Selesai Tugas</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Checklist */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">Checklist Hari Ini</h2>
            </div>
            <span className="text-xs text-gray-500">{doneCount}/{checklist.length}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.done ? "bg-green-500 border-green-500" : "border-gray-300"
                }`}>
                  {item.done && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${item.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {item.item}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {/* Work Schedule */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Clock size={15} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Jadwal Kerja</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {SCHEDULE.map((s, i) => (
                <div key={i} className={`px-5 py-3 flex gap-3 ${s.status === "active" ? "bg-blue-50" : ""}`}>
                  <div className={`w-1.5 rounded-full flex-shrink-0 ${
                    s.status === "done" ? "bg-green-400" :
                    s.status === "active" ? "bg-blue-500" : "bg-gray-200"
                  }`} />
                  <div>
                    <p className={`text-xs font-medium ${s.status === "active" ? "text-blue-700" : "text-gray-700"}`}>{s.activity}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.time}</p>
                  </div>
                  {s.status === "done" && <Check size={14} className="text-green-500 ml-auto flex-shrink-0" />}
                  {s.status === "active" && (
                    <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full flex-shrink-0">Aktif</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Photos */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Camera size={15} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Foto Progress</h2>
              </div>
              <button className="text-xs text-blue-600 flex items-center gap-1">
                <Plus size={12} /> Upload
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {PROGRESS_PHOTOS.map((photo) => (
                <div key={photo.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Camera size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800">{photo.title}</p>
                    <p className="text-xs text-gray-400">{photo.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    photo.status === "submitted" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {photo.status === "submitted" ? "Terkirim" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Material Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Request Material</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Material</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Cari material..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>m³</option><option>kg</option><option>buah</option><option>sak</option><option>liter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} placeholder="Keperluan material..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRequestModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Batal</button>
                <button onClick={() => setShowRequestModal(false)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Kirim Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
