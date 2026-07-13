import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus, Edit2, Search, Package, Users, Wrench, X, CheckCircle2, Box, Trash2 } from "lucide-react";

export function MasterAHSP() {
  const [ahspItems, setAhspItems] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ahspToEdit, setAhspToEdit] = useState<any>(null);
  
  // Form state
  const [formAhsp, setFormAhsp] = useState({ code: '', name: '', unit: 'm³' });
  const [formMaterials, setFormMaterials] = useState<any[]>([]);
  const [formLabors, setFormLabors] = useState<any[]>([]);
  const [formEquipments, setFormEquipments] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('http://localhost:5000/api/ahsps')
      .then(res => res.json())
      .then(data => setAhspItems(data))
      .catch(err => console.error(err));
  }, []);

  const filtered = ahspItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.code.includes(search)
  );

  const openDrawer = (item: any = null) => {
    if (item) {
      setAhspToEdit(item);
      setFormAhsp({ code: item.code, name: item.name, unit: item.unit || 'm³' });
      setFormMaterials(item.materials || []);
      setFormLabors(item.labor || []);
      setFormEquipments(item.equipment || []);
    } else {
      setAhspToEdit(null);
      setFormAhsp({ code: '', name: '', unit: 'm³' });
      setFormMaterials([]);
      setFormLabors([]);
      setFormEquipments([]);
    }
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    // Beautiful Validation
    const errors: Record<string, string> = {};
    if(!formAhsp.code.trim()) errors.code = "Kode wajib diisi";
    if(!formAhsp.name.trim()) errors.name = "Nama wajib diisi";
    
    if(Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    const matTotal = formMaterials.reduce((s, m) => s + (Number(m.coefficient) * Number(m.price)), 0);
    const labTotal = formLabors.reduce((s, l) => s + (Number(l.coefficient) * Number(l.price)), 0);
    const eqTotal = formEquipments.reduce((s, e) => s + (Number(e.coefficient) * Number(e.price)), 0);
    const grandTotal = matTotal + labTotal + eqTotal;

    const newItem = {
      id: formAhsp.code,
      code: formAhsp.code,
      name: formAhsp.name,
      unit: formAhsp.unit,
      unitPrice: grandTotal,
      materials: formMaterials,
      labor: formLabors,
      equipment: formEquipments
    };

    if(ahspToEdit) {
      setAhspItems(ahspItems.map(a => a.code === formAhsp.code ? newItem : a));
    } else {
      setAhspItems([...ahspItems, newItem]);
    }
    
    setIsDrawerOpen(false);
  };

  const addRow = (type: 'material' | 'labor' | 'equipment') => {
    const row = { name: '', unit: '', coefficient: 1, price: 0 };
    if(type === 'material') setFormMaterials([...formMaterials, row]);
    if(type === 'labor') setFormLabors([...formLabors, row]);
    if(type === 'equipment') setFormEquipments([...formEquipments, row]);
  };

  const updateRow = (type: 'material' | 'labor' | 'equipment', index: number, field: string, value: any) => {
    if(type === 'material') {
      const newArr = [...formMaterials];
      newArr[index][field] = value;
      setFormMaterials(newArr);
    }
    if(type === 'labor') {
      const newArr = [...formLabors];
      newArr[index][field] = value;
      setFormLabors(newArr);
    }
    if(type === 'equipment') {
      const newArr = [...formEquipments];
      newArr[index][field] = value;
      setFormEquipments(newArr);
    }
  };

  const removeRow = (type: 'material' | 'labor' | 'equipment', index: number) => {
    if(type === 'material') setFormMaterials(formMaterials.filter((_, i) => i !== index));
    if(type === 'labor') setFormLabors(formLabors.filter((_, i) => i !== index));
    if(type === 'equipment') setFormEquipments(formEquipments.filter((_, i) => i !== index));
  };

  const getLiveGrandTotal = () => {
    const matTotal = formMaterials.reduce((s, m) => s + (Number(m.coefficient) * Number(m.price)), 0);
    const labTotal = formLabors.reduce((s, l) => s + (Number(l.coefficient) * Number(l.price)), 0);
    const eqTotal = formEquipments.reduce((s, e) => s + (Number(e.coefficient) * Number(e.price)), 0);
    return matTotal + labTotal + eqTotal;
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Master AHSP</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis Harga Satuan Pekerjaan — {ahspItems.length} item terdaftar</p>
        </div>
        <button onClick={() => openDrawer()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5">
          <Plus size={16} /> Tambah Item
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama pekerjaan..."
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* AHSP Accordion List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isOpen = expanded === item.id;
          const materials = item.materials || [];
          const labors = item.labor || [];
          const equipments = item.equipment || [];
          
          const matTotal = materials.reduce((s:number, m:any) => s + Number(m.coefficient) * Number(m.price), 0);
          const labTotal = labors.reduce((s:number, l:any) => s + Number(l.coefficient) * Number(l.price), 0);
          const eqTotal = equipments.reduce((s:number, e:any) => s + Number(e.coefficient) * Number(e.price), 0);
          const grandTotal = matTotal + labTotal + eqTotal;

          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Header Row */}
              <div
                className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isOpen ? "bg-blue-50/50 border-b border-blue-100" : ""}`}
                onClick={() => setExpanded(isOpen ? null : item.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-blue-100/50">
                    <span className="text-sm font-bold text-blue-700">{item.code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Package size={12} className="text-blue-500"/> {materials.length} material</span>
                      <span className="flex items-center gap-1.5"><Users size={12} className="text-green-500"/> {labors.length} tenaga kerja</span>
                      {equipments.length > 0 && (
                        <span className="flex items-center gap-1.5"><Wrench size={12} className="text-amber-500"/> {equipments.length} alat</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Satuan / {item.unit}</p>
                    <p className="text-base font-black text-blue-700">Rp {grandTotal.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDrawer(item); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    {isOpen ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isOpen && (
                <div className="px-5 py-5 space-y-6 bg-gray-50/30">
                  {/* Materials */}
                  {materials.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={14} className="text-blue-600" />
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Bahan / Material</h3>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-blue-50/50">
                              <th className="text-left px-4 py-2.5 font-bold text-blue-800">Nama Bahan</th>
                              <th className="text-center px-4 py-2.5 font-bold text-blue-800">Satuan</th>
                              <th className="text-right px-4 py-2.5 font-bold text-blue-800">Koefisien</th>
                              <th className="text-right px-4 py-2.5 font-bold text-blue-800">Harga Satuan</th>
                              <th className="text-right px-4 py-2.5 font-bold text-blue-800">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materials.map((m:any, i:number) => (
                              <tr key={i} className="border-t border-gray-100 bg-white hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700 font-medium">{m.name}</td>
                                <td className="px-4 py-2.5 text-center text-gray-500">{m.unit}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700">{m.coefficient}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700">{Number(m.price).toLocaleString("id-ID")}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-gray-900">{(Number(m.coefficient) * Number(m.price)).toLocaleString("id-ID")}</td>
                              </tr>
                            ))}
                            <tr className="bg-blue-50/30 border-t border-blue-100">
                              <td colSpan={4} className="px-4 py-3 text-right font-bold text-blue-800 text-xs">Total Material</td>
                              <td className="px-4 py-3 text-right font-black text-blue-800">{matTotal.toLocaleString("id-ID")}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Labor */}
                  {labors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-green-600" />
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Tenaga Kerja</h3>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-green-50/50">
                              <th className="text-left px-4 py-2.5 font-bold text-green-800">Nama Tenaga Kerja</th>
                              <th className="text-center px-4 py-2.5 font-bold text-green-800">Satuan</th>
                              <th className="text-right px-4 py-2.5 font-bold text-green-800">Koefisien</th>
                              <th className="text-right px-4 py-2.5 font-bold text-green-800">Upah/Hari</th>
                              <th className="text-right px-4 py-2.5 font-bold text-green-800">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {labors.map((l:any, i:number) => (
                              <tr key={i} className="border-t border-gray-100 bg-white hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700 font-medium">{l.name}</td>
                                <td className="px-4 py-2.5 text-center text-gray-500">{l.unit}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700">{l.coefficient}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700">{Number(l.price).toLocaleString("id-ID")}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-gray-900">{(Number(l.coefficient) * Number(l.price)).toLocaleString("id-ID")}</td>
                              </tr>
                            ))}
                            <tr className="bg-green-50/30 border-t border-green-100">
                              <td colSpan={4} className="px-4 py-3 text-right font-bold text-green-800 text-xs">Total Tenaga Kerja</td>
                              <td className="px-4 py-3 text-right font-black text-green-800">{labTotal.toLocaleString("id-ID")}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {equipments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench size={14} className="text-amber-500" />
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Peralatan</h3>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-amber-50/50">
                              <th className="text-left px-4 py-2.5 font-bold text-amber-800">Nama Alat</th>
                              <th className="text-center px-4 py-2.5 font-bold text-amber-800">Satuan</th>
                              <th className="text-right px-4 py-2.5 font-bold text-amber-800">Koefisien</th>
                              <th className="text-right px-4 py-2.5 font-bold text-amber-800">Harga Satuan</th>
                              <th className="text-right px-4 py-2.5 font-bold text-amber-800">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {equipments.map((e:any, i:number) => (
                              <tr key={i} className="border-t border-gray-100 bg-white hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700 font-medium">{e.name}</td>
                                <td className="px-4 py-2.5 text-center text-gray-500">{e.unit}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700">{e.coefficient}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700">{Number(e.price).toLocaleString("id-ID")}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-gray-900">{(Number(e.coefficient) * Number(e.price)).toLocaleString("id-ID")}</td>
                              </tr>
                            ))}
                            <tr className="bg-amber-50/30 border-t border-amber-100">
                              <td colSpan={4} className="px-4 py-3 text-right font-bold text-amber-800 text-xs">Total Peralatan</td>
                              <td className="px-4 py-3 text-right font-black text-amber-800">{eqTotal.toLocaleString("id-ID")}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-blue-100 shadow-sm">
                    <span className="text-sm font-bold text-gray-900">Harga Satuan Pekerjaan ({item.unit})</span>
                    <span className="text-xl font-black text-blue-700">Rp {grandTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Slide-Over Drawer */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500" onClick={() => setIsDrawerOpen(false)}></div>
        
        <div className={`relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center">
                {ahspToEdit ? <Edit2 size={20} /> : <Plus size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{ahspToEdit ? 'Edit AHSP' : 'Tambah AHSP Baru'}</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">Analisis Harga Satuan Pekerjaan</p>
              </div>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-gray-100">
              <X size={16} />
            </button>
          </div>
          
          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 custom-scrollbar">
            
            {/* Basic Info */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Informasi Pekerjaan
              </h4>
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 md:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Kode <span className="text-red-500">*</span></label>
                  <input value={formAhsp.code} onChange={e => {setFormAhsp({...formAhsp, code: e.target.value}); setFormErrors({...formErrors, code: ''})}} className={`w-full px-3 py-2.5 bg-gray-50 border ${formErrors.code ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:bg-white'} rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2`} placeholder="Ex: 1.1" />
                  {formErrors.code && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span> {formErrors.code}</p>}
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Pekerjaan <span className="text-red-500">*</span></label>
                  <input value={formAhsp.name} onChange={e => {setFormAhsp({...formAhsp, name: e.target.value}); setFormErrors({...formErrors, name: ''})}} className={`w-full px-3 py-2.5 bg-gray-50 border ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:bg-white'} rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2`} placeholder="Nama pekerjaan..." />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span> {formErrors.name}</p>}
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Satuan <span className="text-red-500">*</span></label>
                  <input value={formAhsp.unit} onChange={e => setFormAhsp({...formAhsp, unit: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:ring-blue-500 focus:bg-white rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2" />
                </div>
              </div>
            </div>

            {/* Helper Component for Dynamic Tables */}
            {[
              { type: 'material', title: 'Bahan / Material', color: 'blue', data: formMaterials },
              { type: 'labor', title: 'Tenaga Kerja', color: 'green', data: formLabors },
              { type: 'equipment', title: 'Peralatan', color: 'amber', data: formEquipments }
            ].map((section: any) => (
              <div key={section.type} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-${section.color}-50/30`}>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${section.color}-500`}></span> {section.title}
                  </h4>
                  <button onClick={() => addRow(section.type as any)} className={`flex items-center gap-1 text-xs font-bold text-${section.color}-600 hover:text-${section.color}-700 bg-${section.color}-100 px-3 py-1.5 rounded-lg transition-colors`}>
                    <Plus size={14} /> Tambah
                  </button>
                </div>
                
                {section.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-4 py-2 text-gray-500 font-bold uppercase">Nama</th>
                          <th className="text-center w-20 px-2 py-2 text-gray-500 font-bold uppercase">Satuan</th>
                          <th className="text-right w-24 px-2 py-2 text-gray-500 font-bold uppercase">Koefisien</th>
                          <th className="text-right w-32 px-4 py-2 text-gray-500 font-bold uppercase">Harga</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.data.map((row:any, idx:number) => (
                          <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="p-2">
                              <input value={row.name} onChange={e => updateRow(section.type as any, idx, 'name', e.target.value)} className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 rounded transition-all outline-none" placeholder="Ketik nama..." />
                            </td>
                            <td className="p-2">
                              <input value={row.unit} onChange={e => updateRow(section.type as any, idx, 'unit', e.target.value)} className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 text-center rounded transition-all outline-none" placeholder="Sat" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={row.coefficient} onChange={e => updateRow(section.type as any, idx, 'coefficient', e.target.value)} className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 text-right rounded transition-all outline-none" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={row.price} onChange={e => updateRow(section.type as any, idx, 'price', e.target.value)} className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 text-right font-medium rounded transition-all outline-none" />
                            </td>
                            <td className="p-2 text-center">
                              <button onClick={() => removeRow(section.type as any, idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-400 text-xs font-medium bg-gray-50/50">
                    Belum ada data {section.title.toLowerCase()}. Klik "Tambah" untuk menambahkan.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-sm font-bold text-gray-600">Total Harga Satuan:</span>
              <span className="text-2xl font-black text-blue-700">Rp {getLiveGrandTotal().toLocaleString("id-ID")}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsDrawerOpen(false)} className="w-1/3 py-3.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={handleSave} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                <CheckCircle2 size={18} /> Simpan AHSP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
