import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { RefreshCw, Download, FileSpreadsheet, Save, Edit2, Check, X, Building2, Calculator, ArrowRight, FolderKanban, Plus, Search, Trash2 } from "lucide-react";

const COST_DIST = [
  { name: "Material", value: 58, color: "#3B82F6" },
  { name: "Tenaga Kerja", value: 22, color: "#10B981" },
  { name: "Peralatan", value: 12, color: "#F59E0B" },
  { name: "Overhead", value: 8, color: "#8B5CF6" },
];

export function SmartRAB() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  // RAB Data
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  
  // Modals & Drawers
  const [ahsps, setAhsps] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string | number | null>(null);
  const [searchAhsp, setSearchAhsp] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].db_id || data[0].id);
      })
      .catch(err => console.error(err));
      
    fetch('http://localhost:5000/api/ahsps')
      .then(res => res.json())
      .then(data => setAhsps(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    fetch(`http://localhost:5000/api/rabs?projectId=${selectedProjectId}`)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));
  }, [selectedProjectId]);

  const selectedProject = projects.find(p => (p.db_id || p.id) === selectedProjectId);

  const totalSubtotal = items.filter((i) => !i.isHeader).reduce((s, i) => s + i.subtotal, 0);
  const totalMarkup = items.filter((i) => !i.isHeader).reduce((s, i) => s + (i.subtotal * i.markup / 100), 0);
  const grandTotal = totalSubtotal + totalMarkup;
  const materialCost = grandTotal * 0.58;
  const laborCost = grandTotal * 0.22;
  const equipmentCost = grandTotal * 0.12;
  const profitEstimation = grandTotal * 0.15;

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditValues({ qty: item.qty, unitPrice: item.unitPrice, markup: item.markup });
  };

  const saveEdit = (id: number | string) => {
    const newItems = items.map((item) => {
      if (item.id !== id) return item;
      const qty = editValues.qty ?? item.qty;
      const unitPrice = editValues.unitPrice ?? item.unitPrice;
      const markup = editValues.markup ?? item.markup;
      const subtotal = qty * unitPrice;
      const total = subtotal * (1 + markup / 100);
      return { ...item, qty, unitPrice, markup, subtotal, total };
    });
    setItems(newItems);
    setEditingId(null);
  };

  const removeRow = (id: number | string) => {
    if(window.confirm('Yakin ingin menghapus item ini?')) {
      const idx = items.findIndex(i => i.id === id);
      if(items[idx].isHeader) {
        // Remove header and its children
        const groupItems = items.filter((_, i) => i >= idx && (items[i].isHeader === false || i === idx));
        // We actually need to find all children belonging to this group. Since they are flat and ordered:
        let endIndex = idx + 1;
        while(endIndex < items.length && !items[endIndex].isHeader) {
          endIndex++;
        }
        const newArr = [...items];
        newArr.splice(idx, endIndex - idx);
        setItems(newArr);
      } else {
        setItems(items.filter(i => i.id !== id));
      }
    }
  };

  const saveToDatabase = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rabs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, projectId: selectedProjectId })
      });
      if(res.ok) {
        alert("RAB berhasil disimpan ke database!");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan RAB");
    }
  };

  const openGroupModal = () => {
    setNewGroupName("");
    setIsGroupModalOpen(true);
  };

  const confirmAddGroup = () => {
    if(newGroupName.trim()) {
      const newGroup = {
        id: `new-group-${Date.now()}`,
        isHeader: true,
        workItem: newGroupName.trim().toUpperCase(),
        qty: 0,
        unit: '',
        unitPrice: 0,
        subtotal: 0,
        markup: 0,
        total: 0
      };
      setItems([...items, newGroup]);
    }
    setIsGroupModalOpen(false);
  };

  const openAhspDrawer = (groupId: string | number) => {
    setTargetGroupId(groupId);
    setIsDrawerOpen(true);
  };

  const selectAhspToGroup = (ahsp: any) => {
    // calculate unitPrice of AHSP
    const matTotal = (ahsp.materials || []).reduce((s:number, m:any) => s + (Number(m.coefficient) * Number(m.price)), 0);
    const labTotal = (ahsp.labor || []).reduce((s:number, l:any) => s + (Number(l.coefficient) * Number(l.price)), 0);
    const eqTotal = (ahsp.equipment || []).reduce((s:number, e:any) => s + (Number(e.coefficient) * Number(e.price)), 0);
    const unitPrice = matTotal + labTotal + eqTotal;

    const newItem = {
      id: `new-item-${Date.now()}`,
      isHeader: false,
      workItem: ahsp.name,
      qty: 1, // default
      unit: ahsp.unit,
      unitPrice: unitPrice,
      subtotal: unitPrice * 1,
      markup: 10, // default 10%
      total: (unitPrice * 1) * 1.10
    };

    // Insert the new item right after the target group (or after its existing children)
    const newItems = [...items];
    const groupIndex = newItems.findIndex(i => i.id === targetGroupId);
    
    // Find the end of this group's children
    let insertIndex = groupIndex + 1;
    while(insertIndex < newItems.length && !newItems[insertIndex].isHeader) {
      insertIndex++;
    }
    
    newItems.splice(insertIndex, 0, newItem);
    setItems(newItems);
    setIsDrawerOpen(false);
  };

  const filteredAhsps = ahsps.filter(a => a.name.toLowerCase().includes(searchAhsp.toLowerCase()) || a.code.toLowerCase().includes(searchAhsp.toLowerCase()));

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }} className="space-y-6">
      {/* Header & Project Selector */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-50">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex flex-shrink-0 items-center justify-center shadow-lg shadow-blue-500/30">
              <Calculator className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Rencana Anggaran Biaya (RAB)</h1>
              <p className="text-sm font-medium text-gray-500">
                {selectedProject ? (
                  <span className="flex items-center gap-1.5 mt-0.5">
                    <FolderKanban size={14} className="text-blue-500" />
                    Proyek: <strong className="text-gray-700">{selectedProject.id} - {selectedProject.name}</strong>
                  </span>
                ) : (
                  "Manajemen dan Kalkulasi Anggaran Proyek"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          {/* Custom Project Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center justify-between gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm min-w-[240px]"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FolderKanban size={18} className="text-blue-500 flex-shrink-0" />
                <span className="text-sm font-bold text-gray-800 truncate">
                  {selectedProject ? `${selectedProject.id}` : "Pilih Proyek..."}
                </span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            
            {isProjectDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProjectDropdownOpen(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
                  {projects.map(p => {
                    const pid = p.db_id || p.id;
                    return (
                      <div 
                        key={pid}
                        onClick={() => {
                          setSelectedProjectId(pid);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group ${selectedProjectId === pid ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}
                      >
                        <span className="truncate pr-3">{p.id} - {p.name}</span>
                        {selectedProjectId === pid && <Check size={16} className="text-blue-600 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button onClick={saveToDatabase} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/30 transition-all hover:-translate-y-0.5">
            <Save size={18} /> Simpan Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Spreadsheet */}
        <div className="col-span-12 xl:col-span-8 space-y-4">
          
          {/* Action Bar */}
          <div className="flex justify-end">
            <button onClick={openGroupModal} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-0.5">
              <Plus size={16} /> Tambah Kelompok Pekerjaan
            </button>
          </div>

          {/* Spreadsheet Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm">
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left px-4 py-3.5 font-bold text-gray-700 min-w-[250px]">Uraian Pekerjaan</th>
                    <th className="text-right px-4 py-3.5 font-bold text-gray-700 w-24">Volume</th>
                    <th className="text-center px-4 py-3.5 font-bold text-gray-700 w-16">Sat.</th>
                    <th className="text-right px-4 py-3.5 font-bold text-gray-700 w-36">Harga Satuan</th>
                    <th className="text-right px-4 py-3.5 font-bold text-gray-700 w-36">Subtotal</th>
                    <th className="text-right px-4 py-3.5 font-bold text-gray-700 w-20">Margin</th>
                    <th className="text-right px-4 py-3.5 font-bold text-gray-700 w-36">Total (Rp)</th>
                    <th className="text-center px-4 py-3.5 font-bold text-gray-700 w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">
                        <div className="flex flex-col items-center justify-center">
                          <FolderKanban size={32} className="mb-3 text-gray-300" />
                          <p>Belum ada item RAB untuk proyek ini.</p>
                          <p className="text-xs mt-1">Silakan klik "Tambah Kelompok Pekerjaan" di atas.</p>
                        </div>
                      </td>
                    </tr>
                  ) : items.map((item) => {
                    const isEditing = editingId === item.id;
                    if (item.isHeader) {
                      return (
                        <tr key={item.id} className="bg-gradient-to-r from-blue-50 to-white group">
                          <td colSpan={7} className="px-4 py-3 font-black text-blue-900 border-b border-blue-100 text-[13px] uppercase tracking-wider">
                            {item.workItem}
                          </td>
                          <td className="px-4 py-2 border-b border-blue-100">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openAhspDrawer(item.id)} className="p-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm" title="Tambah Item (AHSP)">
                                <Plus size={14} />
                              </button>
                              <button onClick={() => removeRow(item.id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors group ${isEditing ? "bg-blue-50/30" : ""}`}>
                        <td className="px-4 py-3 text-gray-700 font-medium pl-6">{item.workItem}</td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValues.qty}
                              onChange={(e) => setEditValues((v:any) => ({ ...v, qty: Number(e.target.value) }))}
                              className="w-20 px-2 py-1 border-2 border-blue-400 focus:border-blue-500 focus:ring-0 rounded-lg text-right font-bold text-blue-700 outline-none"
                            />
                          ) : (
                            <span className="font-semibold text-gray-900">{item.qty.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 text-xs font-bold">{item.unit}</td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValues.unitPrice}
                              onChange={(e) => setEditValues((v:any) => ({ ...v, unitPrice: Number(e.target.value) }))}
                              className="w-28 px-2 py-1 border-2 border-blue-400 focus:border-blue-500 focus:ring-0 rounded-lg text-right font-bold text-blue-700 outline-none"
                            />
                          ) : (
                            <span className="text-gray-700">{item.unitPrice.toLocaleString("id-ID")}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-600">
                          {item.subtotal.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="relative inline-block">
                              <input
                                type="number"
                                value={editValues.markup}
                                onChange={(e) => setEditValues((v:any) => ({ ...v, markup: Number(e.target.value) }))}
                                className="w-16 px-2 py-1 border-2 border-blue-400 focus:border-blue-500 focus:ring-0 rounded-lg text-right font-bold text-blue-700 outline-none pr-5"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600">%</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                              {item.markup}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-blue-700 bg-blue-50/10">
                          {item.total.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isEditing ? (
                              <>
                                <button onClick={() => saveEdit(item.id)} className="p-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg shadow-sm transition-colors">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(item)} className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg shadow-sm transition-all">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => removeRow(item.id)} className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 rounded-lg shadow-sm transition-all">
                                  <Trash2 size={14} />
                                </button>
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
            
            {/* Table Footer */}
            <div className="bg-gray-50 border-t border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Subtotal murni: <strong className="text-gray-900">Rp {totalSubtotal.toLocaleString("id-ID")}</strong></span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">Total Margin: <strong className="text-green-600">Rp {totalMarkup.toLocaleString("id-ID")}</strong></span>
                <div className="hidden md:block h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-blue-100 shadow-sm">
                  <span className="font-bold text-gray-900">GRAND TOTAL</span>
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics omitted slightly for brevity but maintained for layout */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-5">Alokasi Biaya (Estimasi)</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: "Material", value: materialCost, color: "bg-blue-500" },
                { label: "Tenaga Kerja", value: laborCost, color: "bg-emerald-500" },
                { label: "Peralatan", value: equipmentCost, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="font-bold text-gray-900">Rp {(item.value / 1_000_000).toFixed(1)}Jt</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / grandTotal) * 100 || 0}%` }}></div>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Estimasi Profit</p>
                    <p className="text-[10px] text-emerald-600">Margin rata-rata 15%</p>
                  </div>
                  <span className="text-lg font-black text-emerald-700">Rp {(profitEstimation / 1_000_000).toFixed(1)}Jt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AHSP Picker Drawer */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500" onClick={() => setIsDrawerOpen(false)}></div>
        
        <div className={`relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Pilih Master AHSP</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">Tambahkan ke RAB</p>
              </div>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-gray-100">
              <X size={16} />
            </button>
          </div>
          
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchAhsp}
                onChange={(e) => setSearchAhsp(e.target.value)}
                placeholder="Cari kode atau nama AHSP..."
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
            <div className="space-y-3">
              {filteredAhsps.map(ahsp => {
                const matTotal = (ahsp.materials || []).reduce((s:number, m:any) => s + (Number(m.coefficient) * Number(m.price)), 0);
                const labTotal = (ahsp.labor || []).reduce((s:number, l:any) => s + (Number(l.coefficient) * Number(l.price)), 0);
                const eqTotal = (ahsp.equipment || []).reduce((s:number, e:any) => s + (Number(e.coefficient) * Number(e.price)), 0);
                const uPrice = matTotal + labTotal + eqTotal;

                return (
                  <div key={ahsp.id} onClick={() => selectAhspToGroup(ahsp)} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{ahsp.code}</span>
                      <span className="text-sm font-black text-gray-900">Rp {uPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1 leading-snug group-hover:text-blue-700 transition-colors">{ahsp.name}</p>
                    <p className="text-xs text-gray-500 font-medium">Satuan: {ahsp.unit}</p>
                  </div>
                );
              })}
              {filteredAhsps.length === 0 && (
                <div className="text-center p-6 text-gray-400 text-sm font-medium">
                  AHSP tidak ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsGroupModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 opacity-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderKanban size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-900">Tambah Kelompok</h3>
              </div>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Kelompok Pekerjaan</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Misal: PEKERJAAN ATAP"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmAddGroup()}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Batal
              </button>
              <button onClick={confirmAddGroup} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all">
                Simpan Kelompok
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
