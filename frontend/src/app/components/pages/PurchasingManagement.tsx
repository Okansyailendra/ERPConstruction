import { useState, useEffect } from "react";
import { List, LayoutGrid, Plus, Search, Filter, MoreHorizontal, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { formatCurrency, getStatusBadge } from "../../data/mockData";

type KanbanStatus = "request" | "pending-approval" | "ordered" | "received" | "delivered";

interface Purchase {
  id: string;
  material: string;
  qty: number;
  unit: string;
  supplier: string;
  total: number;
  status: KanbanStatus;
  approval: "approved" | "pending" | "rejected";
  requestDate: string;
  deliveryDate: string;
  project: string;
}

const KANBAN_COLUMNS: { id: KanbanStatus; label: string; color: string; bgColor: string }[] = [
  { id: "request", label: "Purchase Request", color: "border-blue-400", bgColor: "bg-blue-50" },
  { id: "pending-approval", label: "Finance Approval", color: "border-amber-400", bgColor: "bg-amber-50" },
  { id: "ordered", label: "Purchase Order", color: "border-purple-400", bgColor: "bg-purple-50" },
  { id: "received", label: "Goods Received", color: "border-teal-400", bgColor: "bg-teal-50" },
  { id: "delivered", label: "Delivered", color: "border-green-400", bgColor: "bg-green-50" },
];

const WORKFLOW_STEPS = ["Purchase Request", "Finance Approval", "Purchase Order", "Goods Received", "Delivered to Project"];

export function PurchasingManagement() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Data & Lookups
  const [formData, setFormData] = useState({ projectId: "", supplierId: "", materialCode: "", qty: 1, price: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  const fetchPurchases = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/purchases");
      const data = await res.json();
      setPurchases(data);
    } catch (error) {
      console.error("Failed to fetch purchases", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    // Load lookups for modal
    const loadLookups = async () => {
      try {
        const [projRes, suppRes, matRes] = await Promise.all([
          fetch("http://localhost:5000/api/projects").then(r => r.json()),
          fetch("http://localhost:5000/api/suppliers").then(r => r.json()),
          fetch("http://localhost:5000/api/materials").then(r => r.json())
        ]);
        setProjects(projRes);
        setSuppliers(suppRes);
        setMaterials(matRes);
      } catch (err) {
        console.error("Failed to load lookups", err);
      }
    };
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await fetch("http://localhost:5000/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setFormData({ projectId: "", supplierId: "", materialCode: "", qty: 1, price: 0 });
      fetchPurchases();
    } catch (error) {
      console.error("Failed to create purchase request", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
    setOpenMenu(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await fetch(`http://localhost:5000/api/purchases/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchPurchases();
    } catch (error) {
      console.error("Failed to delete purchase", error);
    }
  };

  const handleApprove = async (id: string, currentStatus: string) => {
    let nextStatus = "";
    if (currentStatus === "request") nextStatus = "pending-approval";
    else if (currentStatus === "pending-approval") nextStatus = "ordered";
    else if (currentStatus === "ordered") nextStatus = "received";
    else if (currentStatus === "received") nextStatus = "delivered";
    else return;

    try {
      await fetch(`http://localhost:5000/api/purchases/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      setOpenMenu(null);
      fetchPurchases();
    } catch (error) {
      console.error("Failed to approve purchase", error);
    }
  };

  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | KanbanStatus>("All");

  const filtered = purchases.filter((p) => {
    const matchSearch = (p.material && p.material.toLowerCase().includes(search.toLowerCase())) ||
                        (p.supplier && p.supplier.toLowerCase().includes(search.toLowerCase())) ||
                        (p.id && p.id.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-blue-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Purchasing Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola seluruh proses pengadaan material</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Purchase Request
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">New Purchase Request</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Project...</option>
                  {projects.map(p => <option key={p.db_id} value={p.db_id}>{p.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <select required value={formData.materialCode} onChange={e => setFormData({...formData, materialCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Material...</option>
                  {materials.map(m => <option key={m.code} value={m.code}>{m.name} ({m.unit}) - {formatCurrency(m.purchasePrice)}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input required type="number" min="1" value={formData.qty} onChange={e => setFormData({...formData, qty: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Unit Price</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70">
                  {submitLoading && <Loader2 size={16} className="animate-spin" />} Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  i <= 2 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap ${i <= 2 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                  {step}
                </span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <ChevronRight size={14} className={`mx-1 flex-shrink-0 ${i < 2 ? "text-blue-400" : "text-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari material, supplier..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <Filter size={14} /> Filter {filterStatus !== "All" && " (Active)"}
          </button>
          {showFilter && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setShowFilter(false)} />
              <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
                <button onClick={() => { setFilterStatus("All"); setShowFilter(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Semua Status</button>
                {KANBAN_COLUMNS.map(col => (
                  <button key={col.id} onClick={() => { setFilterStatus(col.id); setShowFilter(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {col.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-1 ml-auto bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
              view === "kanban" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
              view === "table" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <List size={14} /> Table
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const cards = filtered.filter((p) => p.status === col.id);
            return (
              <div key={col.id} className="flex-shrink-0 w-64">
                <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg border-l-4 ${col.color} ${col.bgColor}`}>
                  <span className="text-sm font-medium text-gray-800">{col.label}</span>
                  <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                    {cards.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-32">
                  {cards.map((card) => {
                    const badge = getStatusBadge(card.approval);
                    return (
                      <div key={card.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-semibold text-blue-600">{card.id}</p>
                          <div className="relative">
                            <button onClick={() => setOpenMenu(openMenu === card.id ? null : card.id)} className="text-gray-300 hover:text-gray-500">
                              <MoreHorizontal size={14} />
                            </button>
                            {openMenu === card.id && (
                              <>
                                <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
                                <div className="absolute right-0 top-6 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
                                  {card.status !== 'delivered' && (
                                    <button onClick={() => handleApprove(card.id, card.status)} className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-gray-50 font-medium">Lanjut Status</button>
                                  )}
                                  <button onClick={() => handleDeleteClick(card.id)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 font-medium">Hapus</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{card.material}</p>
                        <p className="text-xs text-gray-500 mb-2">{card.qty} {card.unit}</p>
                        <div className="text-xs text-gray-500 mb-3">
                          <p className="truncate">Supplier: {card.supplier}</p>
                          <p>Delivery: {card.deliveryDate}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-900">{formatCurrency(card.total)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}>{badge.label}</span>
                        </div>
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400">Tidak ada item</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["ID", "Material", "Qty", "Supplier", "Proyek", "Total", "Delivery", "Status", "Approval", "Aksi"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const statusBadge = getStatusBadge(p.status);
                  const approvalBadge = getStatusBadge(p.approval);
                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-xs font-medium text-blue-600 whitespace-nowrap">{p.id}</td>
                      <td className="px-4 py-3 text-xs text-gray-800">
                        <p className="font-medium">{p.material}</p>
                        <p className="text-gray-400">{p.qty} {p.unit}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{p.qty} {p.unit}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px] truncate">{p.supplier}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{p.project}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatCurrency(p.total)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{p.deliveryDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>{statusBadge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${approvalBadge.color}`}>{approvalBadge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)} className="p-1 hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal size={15} className="text-gray-400" />
                          </button>
                          {openMenu === p.id && (
                            <>
                              <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
                              <div className="absolute right-8 top-0 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
                                {p.status !== 'delivered' && (
                                  <button onClick={() => handleApprove(p.id, p.status)} className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-gray-50 font-medium">Lanjut Status</button>
                                )}
                                <button onClick={() => handleDeleteClick(p.id)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 font-medium">Hapus</button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pengajuan?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus {deleteConfirmId} secara permanen? Tindakan ini tidak dapat dibatalkan.
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

    </div>
  );
}
