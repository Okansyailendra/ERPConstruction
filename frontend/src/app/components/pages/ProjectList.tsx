import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency, getStatusBadge } from "../../data/mockData";
import { useProjects, ProjectData } from "../../hooks/useProjects";

const ALL_TYPES = ["All", "Commercial", "Residential", "Renovation", "Interior", "Infrastructure"];
const ALL_STATUS = ["All", "on-track", "at-risk", "delayed", "completed"];

export function ProjectList() {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [detailProject, setDetailProject] = useState<ProjectData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || p.type === filterType;
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
      setOpenMenu(null);
    }
  };

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Daftar Proyek</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {projects.length} proyek terdaftar</p>
        </div>
        <button
          onClick={() => navigate("/projects/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Tambah Proyek
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari proyek atau customer..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALL_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALL_STATUS.map((s) => <option key={s}>{s === "All" ? "All Status" : s}</option>)}
          </select>

          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Proyek</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Tipe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">PM</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
                    Tidak ada proyek ditemukan
                  </td>
                </tr>
              ) : (
                paginated.map((project, i) => {
                  const badge = getStatusBadge(project.status);
                  return (
                    <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">{(page - 1) * perPage + i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 max-w-[200px] leading-snug">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.id}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px]">
                        <p className="truncate">{project.customer}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{project.type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{project.pm}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatCurrency(project.budget)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                project.progress >= 80 ? "bg-green-500" :
                                project.progress >= 50 ? "bg-blue-500" : "bg-amber-400"
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-8 flex-shrink-0">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{project.deadline}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex justify-center">
                          <button
                            onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal size={16} className="text-gray-500" />
                          </button>
                          {openMenu === project.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
                              <button onClick={() => { setDetailProject(project); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                <Eye size={13} /> Detail
                              </button>
                              <button onClick={() => navigate(`/projects/edit/${project.id}`)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                <Edit size={13} /> Edit
                              </button>
                              <button onClick={() => { setDeleteConfirmId(project.id); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                                <Trash2 size={13} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Menampilkan {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} dari {filtered.length} proyek
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs border ${
                  p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Proyek?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus proyek ini secara permanen? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl text-sm hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{detailProject.name}</h3>
                <p className="text-sm text-gray-500">{detailProject.id} • {detailProject.type}</p>
              </div>
              <button onClick={() => setDetailProject(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                <span className="sr-only">Tutup</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-xs text-gray-500 mb-1">Status</p>
                   <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(detailProject.status).color}`}>{getStatusBadge(detailProject.status).label}</span>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-xs text-gray-500 mb-1">Progress</p>
                   <p className="text-sm font-bold text-gray-900">{detailProject.progress}%</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-xs text-gray-500 mb-1">Nilai Kontrak</p>
                   <p className="text-sm font-bold text-gray-900">{formatCurrency(detailProject.contractValue)}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-xs text-gray-500 mb-1">Budget</p>
                   <p className="text-sm font-bold text-gray-900">{formatCurrency(detailProject.budget)}</p>
                 </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Informasi Umum</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div><span className="text-gray-500">Klien:</span> <span className="font-medium text-gray-900">{detailProject.customer}</span></div>
                  <div><span className="text-gray-500">Perusahaan:</span> <span className="font-medium text-gray-900">{detailProject.company}</span></div>
                  <div><span className="text-gray-500">Project Manager:</span> <span className="font-medium text-gray-900">{detailProject.pm}</span></div>
                  <div><span className="text-gray-500">Mulai:</span> <span className="font-medium text-gray-900">{detailProject.startDate}</span></div>
                  <div><span className="text-gray-500">Deadline:</span> <span className="font-medium text-gray-900">{detailProject.deadline}</span></div>
                  <div className="sm:col-span-2"><span className="text-gray-500">Lokasi:</span> <span className="font-medium text-gray-900">{detailProject.location}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Spesifikasi Teknis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div><span className="text-gray-500">Luas Bangunan:</span> <span className="font-medium text-gray-900">{detailProject.area} m²</span></div>
                  <div><span className="text-gray-500">Lantai:</span> <span className="font-medium text-gray-900">{detailProject.floors}</span></div>
                  <div><span className="text-gray-500">Material:</span> <span className="font-medium text-gray-900">{detailProject.materialClass}</span></div>
                  <div><span className="text-gray-500">Pekerja:</span> <span className="font-medium text-gray-900">{detailProject.laborType}</span></div>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
               <button 
                  onClick={() => navigate(`/projects/edit/${detailProject.id}`)}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                >
                  <Edit size={14} /> Edit Proyek
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
