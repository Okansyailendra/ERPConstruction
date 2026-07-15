import { useState, useEffect, useRef } from "react";
import { Search, Plus, Printer, Mail, Download, Eye, Loader2 } from "lucide-react";
import { formatCurrency, formatCurrencyFull, getStatusBadge } from "../../data/mockData";

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [formData, setFormData] = useState({ projectId: "", amount: "", dueDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = () => {
    fetch('http://localhost:5000/api/invoices')
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setInvoices(arr);
        if (selectedInvoice) {
            const updated = arr.find((i: any) => i.id === selectedInvoice.id);
            if(updated) setSelectedInvoice(updated);
        } else if (arr.length > 0) {
            setSelectedInvoice(arr[0]);
        }
      })
      .catch(err => console.error(err));

    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => setProjectsList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedInvoice) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("proof", file);

    try {
        await fetch(`http://localhost:5000/api/invoices/${selectedInvoice.id}/pay`, {
            method: "POST",
            body: formData
        });
        fetchData(); // refresh to get 'Paid' status
    } catch (err) {
        console.error("Error uploading payment proof", err);
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.amount || !formData.dueDate) return;
    setIsSubmitting(true);
    try {
      await fetch('http://localhost:5000/api/invoices', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: formData.projectId,
          amount: parseFloat(formData.amount),
          due_date: formData.dueDate
        })
      });
      setIsCreateModalOpen(false);
      setFormData({ projectId: "", amount: "", dueDate: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const filtered = safeInvoices.filter((inv) =>
    inv.id?.toLowerCase().includes(search.toLowerCase()) ||
    inv.project?.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = safeInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = safeInvoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = safeInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const badge = selectedInvoice ? getStatusBadge(selectedInvoice.status) : { color: '', label: '' };

  if(!selectedInvoice) return <div className="p-10 text-center">Loading invoices...</div>;

  return (
    <div className="space-y-5" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Invoice Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola seluruh invoice proyek</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
        >
          <Plus size={16} /> Buat Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Terbayar</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{invoices.filter((i) => i.status === "paid").length} invoice</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Menunggu Pembayaran</p>
          <p className="text-lg font-semibold text-amber-500">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{invoices.filter((i) => i.status === "pending").length} invoice</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Jatuh Tempo (Overdue)</p>
          <p className="text-lg font-semibold text-red-500">{formatCurrency(totalOverdue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{invoices.filter((i) => i.status === "overdue").length} invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Invoice List */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari invoice..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filtered.map((inv) => {
            const b = getStatusBadge(inv.status);
            return (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedInvoice.id === inv.id ? "border-blue-400 shadow-sm" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">{inv.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{inv.project}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.color}`}>{b.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(inv.amount)}</span>
                  <span className="text-xs text-gray-400">Due: {inv.dueDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invoice Detail / Preview */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Detail Invoice</span>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                <Printer size={13} /> Print
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                <Mail size={13} /> Email
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                <Download size={13} /> PDF
              </button>
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="p-6">
            {/* Invoice Header */}
            <div className="flex items-start justify-between mb-6 pb-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">CE</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">PT. ConstructERP Indonesia</p>
                    <p className="text-xs text-gray-400">Jl. Sudirman No. 123, Jakarta Pusat</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">INVOICE</p>
                <p className="text-sm font-semibold text-blue-600 mt-0.5">{selectedInvoice.id}</p>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
              </div>
            </div>

            {/* Bill To + Details */}
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tagihan Kepada</p>
                <p className="text-sm font-semibold text-gray-900">{selectedInvoice.customer}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selectedInvoice.project}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tanggal Invoice:</span>
                    <span className="text-xs text-gray-700">{selectedInvoice.issueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Jatuh Tempo:</span>
                    <span className="text-xs font-medium text-gray-700">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Termin:</span>
                    <span className="text-xs font-medium text-blue-600">{selectedInvoice.term}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-gray-50 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">Deskripsi</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <p className="font-medium">{selectedInvoice.term}</p>
                      <p className="text-xs text-gray-400">{selectedInvoice.project}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrencyFull(selectedInvoice.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Subtotal</span>
                  <span className="text-xs text-gray-700">{formatCurrencyFull(selectedInvoice.amount)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">PPN 11%</span>
                  <span className="text-xs text-gray-700">{formatCurrencyFull(Math.round(selectedInvoice.amount * 0.11))}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrencyFull(Math.round(selectedInvoice.amount * 1.11))}</span>
                </div>
              </div>
            </div>

            {/* Payment Proof Upload */}
            {selectedInvoice.status === "pending" && (
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center bg-blue-50/50">
                <p className="text-xs font-medium text-blue-700 mb-1">Upload Bukti Pembayaran</p>
                <p className="text-xs text-blue-400 mb-3">Format: JPG, PNG, PDF (Max 5MB)</p>
                <input type="file" ref={fileInputRef} onChange={handleUploadProof} className="hidden" accept=".jpg,.png,.pdf" />
                <button 
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center justify-center gap-2 mx-auto disabled:opacity-70 transition-colors"
                >
                  {isUploading && <Loader2 size={14} className="animate-spin" />}
                  {isUploading ? "Mengunggah..." : "Pilih File"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Buat Invoice Baru</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Proyek</label>
                <select 
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="">-- Pilih Proyek --</option>
                  {projectsList.map(p => (
                    <option key={p.db_id} value={p.db_id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Tagihan (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input 
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jatuh Tempo</label>
                <input 
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? "Menyimpan..." : "Buat Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
