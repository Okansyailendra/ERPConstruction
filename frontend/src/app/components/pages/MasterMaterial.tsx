import { useState, useRef, useEffect } from "react";
import { Search, Plus, Upload, Download, FileSpreadsheet, Edit2, Trash2, Filter, MoreHorizontal, AlertTriangle, X, CheckCircle2, Box } from "lucide-react";
import { formatCurrencyFull, getStatusBadge } from "../../data/mockData";

const CATEGORIES = ["All", "Struktur", "Dinding", "Material", "Finishing", "MEP"];

export function MasterMaterial() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [materialToDelete, setMaterialToDelete] = useState<any>(null);
  const [materialToEdit, setMaterialToEdit] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/materials')
      .then(res => res.json())
      .then(data => setMaterialsList(data))
      .catch(err => console.error(err));
  }, []);

  const [newMaterial, setNewMaterial] = useState({
    code: "", name: "", category: "Material", unit: "buah", supplier: "", purchasePrice: "", markup: "", stock: "", minStock: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSaveMaterial = () => {
    const errors: Record<string, string> = {};
    if (!newMaterial.code.trim()) errors.code = "Wajib diisi";
    if (!newMaterial.name.trim()) errors.name = "Wajib diisi";
    if (!newMaterial.purchasePrice) errors.purchasePrice = "Wajib diisi";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newItem = {
      id: `MAT-${Date.now()}`,
      code: newMaterial.code,
      name: newMaterial.name,
      category: newMaterial.category,
      unit: newMaterial.unit,
      supplier: newMaterial.supplier || "-",
      purchasePrice: Number(newMaterial.purchasePrice) || 0,
      markup: Number(newMaterial.markup) || 0,
      sellingPrice: (Number(newMaterial.purchasePrice) || 0) * (1 + (Number(newMaterial.markup) || 0) / 100),
      stock: Number(newMaterial.stock) || 0,
      minStock: Number(newMaterial.minStock) || 0,
      status: "active"
    };

    setMaterialsList([newItem, ...materialsList]);
    setShowAddModal(false);
    setNewMaterial({
      code: "", name: "", category: "Material", unit: "buah", supplier: "", purchasePrice: "", markup: "", stock: "", minStock: ""
    });
    setFormErrors({});
  };

  const confirmDelete = (mat: any) => {
    setMaterialToDelete(mat);
  };

  const executeDelete = () => {
    if (materialToDelete) {
      setMaterialsList(materialsList.filter(m => m.id !== materialToDelete.id));
      setMaterialToDelete(null);
    }
  };

  const handleEdit = (mat: any) => {
    setMaterialToEdit(mat);
    setNewMaterial({
      code: mat.code,
      name: mat.name,
      category: mat.category,
      unit: mat.unit,
      supplier: mat.supplier || "",
      purchasePrice: String(mat.purchasePrice),
      markup: String(mat.markup),
      stock: String(mat.stock),
      minStock: String(mat.minStock)
    });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleUpdateMaterial = () => {
    const errors: Record<string, string> = {};
    if (!newMaterial.code.trim()) errors.code = "Wajib diisi";
    if (!newMaterial.name.trim()) errors.name = "Wajib diisi";
    if (!newMaterial.purchasePrice) errors.purchasePrice = "Wajib diisi";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updated = materialsList.map((m) => {
      if (m.id === materialToEdit.id) {
        return {
          ...m,
          code: newMaterial.code,
          name: newMaterial.name,
          category: newMaterial.category,
          unit: newMaterial.unit,
          supplier: newMaterial.supplier || "-",
          purchasePrice: Number(newMaterial.purchasePrice) || 0,
          markup: Number(newMaterial.markup) || 0,
          sellingPrice: (Number(newMaterial.purchasePrice) || 0) * (1 + (Number(newMaterial.markup) || 0) / 100),
          stock: Number(newMaterial.stock) || 0,
          minStock: Number(newMaterial.minStock) || 0,
        };
      }
      return m;
    });

    setMaterialsList(updated);
    setIsDrawerOpen(false);
    setTimeout(() => setMaterialToEdit(null), 300); // Wait for animation
  };

  const handleExport = () => {
    const headers = ["Kode", "Nama Material", "Kategori", "Satuan", "Supplier", "Harga Beli", "Markup", "Harga Jual", "Stok", "Min. Stok", "Status"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(m => [
        m.code,
        `"${m.name}"`,
        m.category,
        m.unit,
        `"${m.supplier}"`,
        m.purchasePrice,
        m.markup,
        m.sellingPrice,
        m.stock,
        m.minStock,
        m.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "master_material.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Berhasil mengimpor file: ${file.name}`);
      e.target.value = '';
    }
  };

  const filtered = materialsList.filter((m) => {
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
          <p className="text-sm text-gray-500 mt-0.5">{materialsList.length} material terdaftar dalam sistem</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            style={{ display: 'none' }} 
          />
          <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Upload size={14} /> Import Excel
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
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
          { label: "Total Material", value: materialsList.length, color: "text-blue-600" },
          { label: "Material Aktif", value: materialsList.filter((m) => m.status === "active").length, color: "text-green-600" },
          { label: "Low Stock", value: materialsList.filter((m) => m.status === "low-stock").length, color: "text-amber-500" },
          { label: "Out of Stock", value: materialsList.filter((m) => m.status === "out-of-stock").length, color: "text-red-500" },
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
                        <button onClick={() => handleEdit(mat)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => confirmDelete(mat)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
          <p className="text-xs text-gray-500">Menampilkan {filtered.length} dari {materialsList.length} material</p>
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
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Kode Material <span className="text-red-500">*</span></label>
                <input value={newMaterial.code} onChange={e => setNewMaterial({...newMaterial, code: e.target.value})} className={`w-full px-3 py-2 border ${formErrors.code ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg text-sm`} placeholder="MAT-XXX" />
                {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Material <span className="text-red-500">*</span></label>
                <input value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg text-sm`} placeholder="Nama material" />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                <select value={newMaterial.category} onChange={e => setNewMaterial({...newMaterial, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {["Struktur", "Dinding", "Material", "Finishing", "MEP"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Satuan <span className="text-red-500">*</span></label>
                <select value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {["m³", "kg", "buah", "sak", "liter", "m²", "batang"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Supplier (Opsional)</label>
                <input value={newMaterial.supplier} onChange={e => setNewMaterial({...newMaterial, supplier: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nama supplier" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Harga Beli (Rp) <span className="text-red-500">*</span></label>
                <input type="number" value={newMaterial.purchasePrice} onChange={e => setNewMaterial({...newMaterial, purchasePrice: e.target.value})} className={`w-full px-3 py-2 border ${formErrors.purchasePrice ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg text-sm`} placeholder="0" />
                {formErrors.purchasePrice && <p className="text-red-500 text-xs mt-1">{formErrors.purchasePrice}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Markup (%) (Opsional)</label>
                <input type="number" value={newMaterial.markup} onChange={e => setNewMaterial({...newMaterial, markup: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Stok Awal (Opsional)</label>
                <input type="number" value={newMaterial.stock} onChange={e => setNewMaterial({...newMaterial, stock: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Minimum Stok (Opsional)</label>
                <input type="number" value={newMaterial.minStock} onChange={e => setNewMaterial({...newMaterial, minStock: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setFormErrors({}); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Batal</button>
              <button onClick={handleSaveMaterial} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Simpan Material</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {materialToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Material?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-700">{materialToDelete.name}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setMaterialToDelete(null)} 
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={executeDelete} 
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Material Slide-Over Drawer */}
      {(isDrawerOpen || materialToEdit) && (
        <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          
          {/* Drawer Panel */}
          <div className={`relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center transform hover:scale-110 transition-transform">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Edit Material</h3>
                  <p className="text-xs text-blue-600 font-medium">Ubah spesifikasi material</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                
                {/* Visual Status Indicator */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                     <Box size={24} className="text-blue-500" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-bold text-gray-900">{newMaterial.name || 'Nama Material'}</p>
                     <p className="text-xs text-gray-500 font-mono mt-0.5">{newMaterial.code || 'Kode'}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Kategori</p>
                     <span className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">{newMaterial.category}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Informasi Dasar
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kode Material <span className="text-red-500">*</span></label>
                      <input value={newMaterial.code} onChange={e => setNewMaterial({...newMaterial, code: e.target.value})} className={`w-full px-3 py-2.5 bg-gray-50 border ${formErrors.code ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:bg-white'} rounded-xl text-sm transition-all focus:outline-none focus:ring-2`} />
                      {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                      <select value={newMaterial.category} onChange={e => setNewMaterial({...newMaterial, category: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:ring-blue-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-2">
                        {["Struktur", "Dinding", "Material", "Finishing", "MEP"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Material <span className="text-red-500">*</span></label>
                      <input value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className={`w-full px-3 py-2.5 bg-gray-50 border ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:bg-white'} rounded-xl text-sm transition-all focus:outline-none focus:ring-2`} />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Satuan <span className="text-red-500">*</span></label>
                      <select value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:ring-blue-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-2">
                        {["m³", "kg", "buah", "sak", "liter", "m²", "batang"].map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Supplier</label>
                      <input value={newMaterial.supplier} onChange={e => setNewMaterial({...newMaterial, supplier: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:ring-blue-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Harga & Stok
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Harga Beli (Rp) <span className="text-red-500">*</span></label>
                      <input type="number" value={newMaterial.purchasePrice} onChange={e => setNewMaterial({...newMaterial, purchasePrice: e.target.value})} className={`w-full px-3 py-2.5 bg-gray-50 border ${formErrors.purchasePrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:bg-white'} rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2`} />
                      {formErrors.purchasePrice && <p className="text-red-500 text-xs mt-1">{formErrors.purchasePrice}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Markup (%)</label>
                      <input type="number" value={newMaterial.markup} onChange={e => setNewMaterial({...newMaterial, markup: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:ring-blue-500 focus:bg-white rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stok Saat Ini</label>
                      <input type="number" value={newMaterial.stock} onChange={e => setNewMaterial({...newMaterial, stock: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:ring-blue-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Minimum Stok</label>
                      <input type="number" value={newMaterial.minStock} onChange={e => setNewMaterial({...newMaterial, minStock: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:ring-blue-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-2" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-white">
               <div className="flex gap-3">
                 <button onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Batal</button>
                 <button onClick={handleUpdateMaterial} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                   <CheckCircle2 size={16} /> Simpan
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
