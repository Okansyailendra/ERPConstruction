import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Edit2, Search, Package, Users, Wrench } from "lucide-react";
import { ahspItems } from "../../data/mockData";

type AhspItem = typeof ahspItems[number];

export function MasterAHSP() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = ahspItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.code.includes(search)
  );

  const getTotal = (item: AhspItem) => {
    const matTotal = item.materials.reduce((s, m) => s + m.coefficient * m.price, 0);
    const labTotal = item.labor.reduce((s, l) => s + l.coefficient * l.price, 0);
    const eqTotal = item.equipment.reduce((s, e) => s + e.coefficient * e.price, 0);
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
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Tambah Item
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama pekerjaan..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* AHSP Accordion List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isOpen = expanded === item.id;
          const matTotal = item.materials.reduce((s, m) => s + m.coefficient * m.price, 0);
          const labTotal = item.labor.reduce((s, l) => s + l.coefficient * l.price, 0);
          const eqTotal = item.equipment.reduce((s, e) => s + e.coefficient * e.price, 0);
          const grandTotal = matTotal + labTotal + eqTotal;

          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header Row */}
              <div
                className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isOpen ? "bg-blue-50 border-b border-blue-100" : ""}`}
                onClick={() => setExpanded(isOpen ? null : item.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">{item.code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Package size={10} /> {item.materials.length} material</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {item.labor.length} tenaga kerja</span>
                      {item.equipment.length > 0 && (
                        <span className="flex items-center gap-1"><Wrench size={10} /> {item.equipment.length} alat</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Satuan / {item.unit}</p>
                    <p className="text-base font-bold text-blue-700">Rp {grandTotal.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    {isOpen ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isOpen && (
                <div className="px-5 py-4 space-y-5">
                  {/* Materials */}
                  {item.materials.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={14} className="text-blue-600" />
                        <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Bahan / Material</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="text-left px-3 py-2 font-medium text-blue-700">Nama Bahan</th>
                              <th className="text-center px-3 py-2 font-medium text-blue-700">Satuan</th>
                              <th className="text-right px-3 py-2 font-medium text-blue-700">Koefisien</th>
                              <th className="text-right px-3 py-2 font-medium text-blue-700">Harga Satuan</th>
                              <th className="text-right px-3 py-2 font-medium text-blue-700">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.materials.map((m, i) => (
                              <tr key={i} className="border-b border-gray-100">
                                <td className="px-3 py-2 text-gray-700">{m.name}</td>
                                <td className="px-3 py-2 text-center text-gray-500">{m.unit}</td>
                                <td className="px-3 py-2 text-right text-gray-700">{m.coefficient}</td>
                                <td className="px-3 py-2 text-right text-gray-700">{m.price.toLocaleString("id-ID")}</td>
                                <td className="px-3 py-2 text-right font-medium text-gray-900">{(m.coefficient * m.price).toLocaleString("id-ID")}</td>
                              </tr>
                            ))}
                            <tr className="bg-blue-50/50">
                              <td colSpan={4} className="px-3 py-2 text-right font-semibold text-blue-700 text-xs">Total Material</td>
                              <td className="px-3 py-2 text-right font-bold text-blue-700">{matTotal.toLocaleString("id-ID")}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Labor */}
                  {item.labor.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-green-600" />
                        <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Tenaga Kerja</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-green-50">
                              <th className="text-left px-3 py-2 font-medium text-green-700">Nama Tenaga Kerja</th>
                              <th className="text-center px-3 py-2 font-medium text-green-700">Satuan</th>
                              <th className="text-right px-3 py-2 font-medium text-green-700">Koefisien</th>
                              <th className="text-right px-3 py-2 font-medium text-green-700">Upah/Hari</th>
                              <th className="text-right px-3 py-2 font-medium text-green-700">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.labor.map((l, i) => (
                              <tr key={i} className="border-b border-gray-100">
                                <td className="px-3 py-2 text-gray-700">{l.name}</td>
                                <td className="px-3 py-2 text-center text-gray-500">{l.unit}</td>
                                <td className="px-3 py-2 text-right text-gray-700">{l.coefficient}</td>
                                <td className="px-3 py-2 text-right text-gray-700">{l.price.toLocaleString("id-ID")}</td>
                                <td className="px-3 py-2 text-right font-medium text-gray-900">{(l.coefficient * l.price).toLocaleString("id-ID")}</td>
                              </tr>
                            ))}
                            <tr className="bg-green-50/50">
                              <td colSpan={4} className="px-3 py-2 text-right font-semibold text-green-700 text-xs">Total Tenaga Kerja</td>
                              <td className="px-3 py-2 text-right font-bold text-green-700">{labTotal.toLocaleString("id-ID")}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {item.equipment.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench size={14} className="text-amber-500" />
                        <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Peralatan</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-amber-50">
                              <th className="text-left px-3 py-2 font-medium text-amber-700">Nama Alat</th>
                              <th className="text-center px-3 py-2 font-medium text-amber-700">Satuan</th>
                              <th className="text-right px-3 py-2 font-medium text-amber-700">Koefisien</th>
                              <th className="text-right px-3 py-2 font-medium text-amber-700">Harga Satuan</th>
                              <th className="text-right px-3 py-2 font-medium text-amber-700">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.equipment.map((e, i) => (
                              <tr key={i} className="border-b border-gray-100">
                                <td className="px-3 py-2 text-gray-700">{e.name}</td>
                                <td className="px-3 py-2 text-center text-gray-500">{e.unit}</td>
                                <td className="px-3 py-2 text-right text-gray-700">{e.coefficient}</td>
                                <td className="px-3 py-2 text-right text-gray-700">{e.price.toLocaleString("id-ID")}</td>
                                <td className="px-3 py-2 text-right font-medium text-gray-900">{(e.coefficient * e.price).toLocaleString("id-ID")}</td>
                              </tr>
                            ))}
                            <tr className="bg-amber-50/50">
                              <td colSpan={4} className="px-3 py-2 text-right font-semibold text-amber-700 text-xs">Total Peralatan</td>
                              <td className="px-3 py-2 text-right font-bold text-amber-700">{eqTotal.toLocaleString("id-ID")}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex items-center justify-between pt-3 border-t-2 border-blue-200">
                    <span className="text-sm font-bold text-gray-900">Harga Satuan Pekerjaan ({item.unit})</span>
                    <span className="text-lg font-bold text-blue-700">Rp {grandTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
