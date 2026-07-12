import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShoppingCart, Clock, CheckSquare, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { purchases, materials, formatCurrency, getStatusBadge } from "../../data/mockData";

const SUPPLIER_PERFORMANCE = [
  { supplier: "Holcim", onTime: 95, quality: 92 },
  { supplier: "Krakatau Steel", onTime: 88, quality: 90 },
  { supplier: "Semen Indonesia", onTime: 98, quality: 96 },
  { supplier: "Roman Ceramik", onTime: 72, quality: 88 },
  { supplier: "Nippon Paint", onTime: 90, quality: 94 },
];

const TOP_MATERIALS = [
  { name: "Beton K-300", qty: "250 m³", value: 212_500_000, trend: "up" },
  { name: "Besi Beton D13", qty: "8,500 kg", value: 119_000_000, trend: "up" },
  { name: "Semen Portland", qty: "1,200 sak", value: 78_000_000, trend: "down" },
  { name: "Keramik 60x60", qty: "800 m²", value: 100_000_000, trend: "up" },
  { name: "Cat Eksterior", qty: "500 liter", value: 42_500_000, trend: "down" },
];

function KpiCard({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub: string; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-blue-600 mt-1">{sub}</p>
    </div>
  );
}

export function PurchasingDashboard() {
  const pending = purchases.filter((p) => p.status === "pending-approval").length;
  const ordered = purchases.filter((p) => p.status === "ordered").length;
  const received = purchases.filter((p) => p.status === "received" || p.status === "delivered").length;
  const lowStock = materials.filter((m) => m.status === "low-stock" || m.status === "out-of-stock");

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Purchasing Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manajemen pengadaan material &mdash; November 2024</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Purchase Requests" value={purchases.length} sub="Bulan ini" icon={<ShoppingCart size={18} className="text-blue-600" />} color="bg-blue-50" />
        <KpiCard label="Pending Approval" value={pending} sub="Menunggu approval" icon={<Clock size={18} className="text-amber-500" />} color="bg-amber-50" />
        <KpiCard label="Purchase Orders" value={ordered} sub="Sudah di-PO" icon={<CheckSquare size={18} className="text-purple-600" />} color="bg-purple-50" />
        <KpiCard label="Goods Received" value={received} sub="Diterima bulan ini" icon={<Package size={18} className="text-green-600" />} color="bg-green-50" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Supplier Performance */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Performa Supplier (On-Time & Quality)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SUPPLIER_PERFORMANCE} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="supplier" type="category" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip formatter={(v) => [`${v}%`]} />
              <Bar dataKey="onTime" fill="#2563EB" name="On-Time" radius={[0, 3, 3, 0]} />
              <Bar dataKey="quality" fill="#16A34A" name="Quality" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Alerts */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900">Stock Alert</h2>
            <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">{lowStock.length}</span>
          </div>
          <div className="space-y-3">
            {lowStock.map((m) => {
              const badge = getStatusBadge(m.status);
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{m.name}</p>
                    <p className="text-xs text-gray-400">Stok: {m.stock.toLocaleString()} {m.unit} | Min: {m.minStock.toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badge.color}`}>{badge.label}</span>
                </div>
              );
            })}
            {lowStock.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Semua stok aman</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Purchase Activity Table */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Aktivitas Pembelian Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Material</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Supplier</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => {
                  const badge = getStatusBadge(p.status);
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-xs font-medium text-blue-600">{p.id}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{p.material} ({p.qty} {p.unit})</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{p.supplier}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatCurrency(p.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Materials */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Top Material Dibeli</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {TOP_MATERIALS.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.qty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-gray-900">{formatCurrency(item.value)}</p>
                  <div className={`text-xs flex items-center gap-0.5 justify-end ${item.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                    <TrendingUp size={10} className={item.trend === "down" ? "rotate-180" : ""} />
                    {item.trend === "up" ? "+8%" : "-3%"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
