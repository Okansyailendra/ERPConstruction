import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { RefreshCw, Download, FileSpreadsheet, Save, Edit2, Check, X, Zap } from "lucide-react";
import { rabItems, formatCurrencyFull } from "../../data/mockData";

type RabItem = typeof rabItems[number];

const COST_DIST = [
  { name: "Material", value: 58, color: "#2563EB" },
  { name: "Labor", value: 22, color: "#16A34A" },
  { name: "Equipment", value: 12, color: "#F59E0B" },
  { name: "Overhead", value: 8, color: "#8B5CF6" },
];

const MATERIAL_BREAKDOWN = [
  { name: "Struktur", value: 420 },
  { name: "Dinding", value: 185 },
  { name: "Finishing", value: 282 },
  { name: "MEP", value: 95 },
  { name: "Persiapan", value: 55 },
];

export function SmartRAB() {
  const [items, setItems] = useState<RabItem[]>(rabItems);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<RabItem>>({});
  const [generated, setGenerated] = useState(true);

  const totalSubtotal = items.filter((i) => !i.isHeader).reduce((s, i) => s + i.subtotal, 0);
  const totalMarkup = items.filter((i) => !i.isHeader).reduce((s, i) => s + (i.subtotal * i.markup / 100), 0);
  const grandTotal = totalSubtotal + totalMarkup;
  const materialCost = grandTotal * 0.58;
  const laborCost = grandTotal * 0.22;
  const equipmentCost = grandTotal * 0.12;
  const profitEstimation = grandTotal * 0.15;

  const startEdit = (item: RabItem) => {
    setEditingId(item.id);
    setEditValues({ qty: item.qty, unitPrice: item.unitPrice, markup: item.markup });
  };

  const saveEdit = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const qty = editValues.qty ?? item.qty;
        const unitPrice = editValues.unitPrice ?? item.unitPrice;
        const markup = editValues.markup ?? item.markup;
        const subtotal = qty * unitPrice;
        const total = subtotal * (1 + markup / 100);
        return { ...item, qty, unitPrice, markup, subtotal, total };
      })
    );
    setEditingId(null);
  };

  if (!generated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Zap size={28} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Smart RAB Generator</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Klik tombol Generate untuk membuat RAB otomatis berdasarkan data proyek.
        </p>
        <button
          onClick={() => setGenerated(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700"
        >
          <Zap size={18} /> Generate Smart RAB
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Smart RAB Generator</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gedung Perkantoran Sudirman — PRJ-001</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGenerated(false)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Generate Ulang
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Save size={14} /> Simpan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Main Spreadsheet */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Project Info Banner */}
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <div className="flex gap-6 text-sm">
              <span className="text-gray-600">Proyek: <strong className="text-gray-900">PRJ-001</strong></span>
              <span className="text-gray-600">Luas: <strong className="text-gray-900">4,500 m²</strong></span>
              <span className="text-gray-600">Lantai: <strong className="text-gray-900">12</strong></span>
              <span className="text-gray-600">Kelas: <strong className="text-gray-900">Premium</strong></span>
            </div>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              AI Generated
            </span>
          </div>

          {/* Spreadsheet Table */}
          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 min-w-[200px]">Uraian Pekerjaan</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 min-w-[140px]">Material</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-20">Qty</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 w-12">Sat.</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-28">Harga Sat.</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-28">Subtotal</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-16">Markup</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-28">Total</th>
                  <th className="w-14 px-3 py-2.5 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isEditing = editingId === item.id;
                  if (item.isHeader) {
                    return (
                      <tr key={item.id} className="bg-gray-50">
                        <td colSpan={9} className="px-3 py-2 font-semibold text-gray-800 border-b border-gray-200">
                          {item.workItem}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={item.id} className={`border-b border-gray-100 hover:bg-blue-50/30 ${isEditing ? "bg-blue-50" : ""}`}>
                      <td className="px-3 py-2 text-gray-800">{item.workItem}</td>
                      <td className="px-3 py-2 text-gray-500">{item.material}</td>
                      <td className="px-3 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.qty}
                            onChange={(e) => setEditValues((v) => ({ ...v, qty: Number(e.target.value) }))}
                            className="w-16 px-1 py-0.5 border border-blue-400 rounded text-right text-xs"
                          />
                        ) : (
                          item.qty.toLocaleString()
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{item.unit}</td>
                      <td className="px-3 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.unitPrice}
                            onChange={(e) => setEditValues((v) => ({ ...v, unitPrice: Number(e.target.value) }))}
                            className="w-24 px-1 py-0.5 border border-blue-400 rounded text-right text-xs"
                          />
                        ) : (
                          item.unitPrice.toLocaleString("id-ID")
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">
                        {item.subtotal.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.markup}
                            onChange={(e) => setEditValues((v) => ({ ...v, markup: Number(e.target.value) }))}
                            className="w-12 px-1 py-0.5 border border-blue-400 rounded text-right text-xs"
                          />
                        ) : (
                          `${item.markup}%`
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-700">
                        {item.total.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 justify-center">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(item.id)} className="p-0.5 text-green-600 hover:bg-green-100 rounded">
                                <Check size={13} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-0.5 text-red-500 hover:bg-red-100 rounded">
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(item)} className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded">
                              <Edit2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-blue-600 text-white">
                  <td colSpan={5} className="px-3 py-3 font-bold text-sm">GRAND TOTAL</td>
                  <td className="px-3 py-3 text-right font-bold text-sm">{totalSubtotal.toLocaleString("id-ID")}</td>
                  <td className="px-3 py-3 text-right font-bold text-sm" />
                  <td className="px-3 py-3 text-right font-bold text-sm">{grandTotal.toLocaleString("id-ID")}</td>
                  <td className="px-3 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Biaya</h3>
            <div className="space-y-3">
              {[
                { label: "Material Cost", value: materialCost, color: "text-blue-600" },
                { label: "Labor Cost", value: laborCost, color: "text-green-600" },
                { label: "Equipment Cost", value: equipmentCost, color: "text-amber-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-sm font-medium ${item.color}`}>
                    {formatCurrencyFull(Math.round(item.value)).slice(0, 20)}...
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-800">Grand Total</span>
                <span className="text-sm font-bold text-gray-900">Rp {(grandTotal / 1_000_000_000).toFixed(2)}M</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-green-50 px-3 rounded-lg">
                <span className="text-sm text-green-700 font-medium">Profit Estimasi (15%)</span>
                <span className="text-sm font-bold text-green-700">Rp {(profitEstimation / 1_000_000_000).toFixed(2)}M</span>
              </div>
            </div>
          </div>

          {/* Cost Distribution Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Distribusi Biaya</h3>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={COST_DIST} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {COST_DIST.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {COST_DIST.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Material Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Breakdown Material (Juta Rp)</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={MATERIAL_BREAKDOWN} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={55} />
                <Tooltip formatter={(v) => [`Rp ${v}jt`]} />
                <Bar dataKey="value" fill="#2563EB" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
