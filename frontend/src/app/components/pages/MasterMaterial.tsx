import { useState } from "react";
import { Search, Plus, Upload, Download, FileSpreadsheet, Edit2, Trash2, Filter, MoreHorizontal } from "lucide-react";
import { materials, formatCurrencyFull, getStatusBadge } from "../../data/mockData";

const CATEGORIES = ["All", "Struktur", "Dinding", "Material", "Finishing", "MEP"];

export function MasterMaterial() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = materials.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.supplier.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || m.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Master Material</h1>
          <p className="text-sm text-gray-500 mt-0.5">{materials.length} material terdaftar dalam sistem</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Upload size={14} /> Import Excel
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={16} /> Tambah Material
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Material", value: materials.length, color: "text-blue-600" },
          { label: "Material Aktif", value: materials.filter((m) => m.status === "active").length, color: "text-green-600" },
          { label: "Low Stock", value: materials.filter((m) => m.status === "low-stock").length, color: "text-amber-500" },
          { label: "Out of Stock", value: materials.filter((m) => m.status === "out-of-stock").length, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, nama, atau supplier..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === cat ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filter Lanjutan
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Kode", "Nama Material", "Kategori", "Satuan", "Supplier", "Harga Beli", "Markup", "Harga Jual", "Stok", "Min. Stok", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((mat) => {
                const badge = getStatusBadge(mat.status);
                return (
                  <tr key={mat.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-blue-600">{mat.code}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{mat.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{mat.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{mat.unit}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] truncate">{mat.supplier}</td>
                    <td className="px-4 py-3 text-xs text-gray-800">Rp {mat.purchasePrice.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{mat.markup}%</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">Rp {mat.sellingPrice.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">
                      <span className={mat.stock === 0 ? "text-red-500" : mat.stock <= mat.minStock * 1.2 ? "text-amber-500" : "text-green-600"}>
                        {mat.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{mat.minStock.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-sm text-gray-400">
                    Tidak ada material ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Menampilkan {filtered.length} dari {materials.length} material</p>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-7 h-7 rounded-lg text-xs border ${p === 1 ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Tambah Material Baru</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Kode Material</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="MAT-XXX" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Material</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nama material" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Kategori</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {["Struktur", "Dinding", "Material", "Finishing", "MEP"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Satuan</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {["m³", "kg", "buah", "sak", "liter", "m²", "batang"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Supplier</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nama supplier" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Harga Beli (Rp)</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Markup (%)</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Stok Awal</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Minimum Stok</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Batal</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Simpan Material</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
