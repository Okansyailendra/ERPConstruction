import { useState } from "react";
import { List, LayoutGrid, Plus, Search, Filter, MoreHorizontal, ChevronRight } from "lucide-react";
import { purchases, formatCurrency, getStatusBadge } from "../../data/mockData";

type KanbanStatus = "request" | "pending-approval" | "ordered" | "received" | "delivered";

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

  const filtered = purchases.filter((p) =>
    p.material.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Purchasing Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola seluruh proses pengadaan material</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Purchase Request
        </button>
      </div>

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
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Filter size={14} /> Filter
        </button>
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
                          <button className="text-gray-300 hover:text-gray-500">
                            <MoreHorizontal size={14} />
                          </button>
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
                        <button className="p-1 hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal size={15} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
