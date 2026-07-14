import { useState, useEffect, useRef } from "react";
import { Camera, Upload, CheckSquare, Package, Users, Wrench, Clock, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import { getStatusBadge } from "../../data/mockData";

export function ProjectExecution() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("PRJ-001");
  const [projectsList, setProjectsList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [labor, setLabor] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Progress Form State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressSubmitLoading, setProgressSubmitLoading] = useState(false);
  const [progressForm, setProgressForm] = useState({ reportDate: new Date().toISOString().split('T')[0], progress: 0, milestone: "", description: "" });


  // Photos mock for now
  const PHOTOS = [
    { id: 1, title: "Pengecoran Kolom K-8A", date: "06 Jul 2026", area: "Lantai 8" },
    { id: 2, title: "Pembesian Sloof", date: "05 Jul 2026", area: "Lantai 7" },
    { id: 3, title: "Progress Dinding Lantai 3", date: "04 Jul 2026", area: "Lantai 3" },
  ];

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then(r => r.json())
      .then(data => setProjectsList(data));
  }, []);

  const fetchData = () => {
    if (!selectedProjectId) return;
    setLoading(true);
    
    Promise.all([
      fetch(`http://localhost:5000/api/execution/${selectedProjectId}/overview`).then(r => r.json()),
      fetch(`http://localhost:5000/api/execution/${selectedProjectId}/timelines`).then(r => r.json()),
      fetch(`http://localhost:5000/api/execution/${selectedProjectId}/materials`).then(r => r.json()),
      fetch(`http://localhost:5000/api/execution/${selectedProjectId}/labor`).then(r => r.json()),
      fetch(`http://localhost:5000/api/execution/${selectedProjectId}/photos`).then(r => r.json())
    ]).then(([overview, timelines, mats, lab, pics]) => {
      setProject(overview);
      setMilestones(timelines.filter((t: any) => t.category === "Milestone" || t.progress >= 0).slice(0, 5));
      setTasks(timelines);
      setMaterials(mats);
      setLabor(lab);
      setPhotos(pics);
    }).catch(err => console.error("Error fetching execution data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [selectedProjectId]);

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgressSubmitLoading(true);
    try {
      await fetch(`http://localhost:5000/api/execution/${selectedProjectId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressForm)
      });
      setShowProgressModal(false);
      setProgressForm({ reportDate: new Date().toISOString().split('T')[0], progress: 0, milestone: "", description: "" });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to upload progress", error);
    } finally {
      setProgressSubmitLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;
    
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("title", file.name);

    try {
      await fetch(`http://localhost:5000/api/execution/${selectedProjectId}/photos`, {
        method: "POST",
        body: formData
      });
      fetchData();
    } catch (err) {
      console.error("Error uploading photo", err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-blue-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project || project.message) {
    return <div className="p-5 text-gray-500">Project data not found.</div>;
  }

  const badge = getStatusBadge(project.status || 'delayed');

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Project Execution</h1>
            <p className="text-sm text-gray-500 mt-0.5">{project.name} — {project.id}</p>
          </div>
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="ml-4 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button 
          onClick={() => {
            setProgressForm({ ...progressForm, progress: project.progress || 0 });
            setShowProgressModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Upload size={16} /> Upload Progress
        </button>
      </div>

      {/* Upload Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Upload Progress Lapangan</h2>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleProgressSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Laporan</label>
                  <input required type="date" value={progressForm.reportDate} onChange={e => setProgressForm({...progressForm, reportDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Progress (%)</label>
                  <input required type="number" min="0" max="100" step="0.01" value={progressForm.progress} onChange={e => setProgressForm({...progressForm, progress: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Milestone (Opsional)</label>
                <input type="text" placeholder="Misal: Selesai Pengecoran Lantai 2" value={progressForm.milestone} onChange={e => setProgressForm({...progressForm, milestone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                <textarea rows={3} placeholder="Detail laporan..." value={progressForm.description} onChange={e => setProgressForm({...progressForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowProgressModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                <button type="submit" disabled={progressSubmitLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70">
                  {progressSubmitLoading && <Loader2 size={16} className="animate-spin" />} Simpan Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        {milestones.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada timeline yang tercatat.</p>
        ) : (
          <div className="flex items-center overflow-x-auto pb-2">
            {milestones.map((m: any, i) => {
              const isDone = m.status === 'completed';
              return (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isDone ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"
                    }`}>
                      {isDone ? <Check size={14} className="text-white" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                    </div>
                    <p className={`text-xs text-center mt-1 leading-tight ${isDone ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                      {m.task}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.date}</p>
                  </div>
                  {i < milestones.length - 1 && (
                    <div className={`h-0.5 w-8 mx-1 flex-shrink-0 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Tasks */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <CheckSquare size={15} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Today's Tasks</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {tasks.length === 0 && <p className="p-5 text-sm text-gray-500">Belum ada task hari ini.</p>}
            {tasks.map((task: any) => (
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
              {materials.length === 0 && <p className="px-4 py-3 text-sm text-gray-500">Belum ada material yang digunakan.</p>}
              {materials.map((m: any) => (
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
              {labor.length === 0 && <p className="px-4 py-3 text-sm text-gray-500">Belum ada laporan pekerja.</p>}
              {labor.map((l: any) => (
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
          <h2 className="text-sm font-semibold text-gray-900">Galeri Progress</h2>
          <div className="flex items-center gap-3">
            <button 
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              Upload Foto
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
            <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">Lihat Semua</button>
          </div>
        </div>
        
        {photos.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Belum ada foto progress. Silakan upload.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {photos.map((p) => (
              <div key={p.id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
                {p.url ? (
                  <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-300">
                    <Camera size={32} className="mb-2 opacity-50" />
                    <p className="text-xs font-medium">{p.title}</p>
                    <p className="text-[10px]">{p.date}</p>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs font-semibold truncate">{p.title}</p>
                    <p className="text-[10px] text-gray-300">{p.date} • {p.area}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
