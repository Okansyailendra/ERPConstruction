import { useState, useEffect } from "react";
import { Building2, Bell, Shield, Wallet, Save, Upload } from "lucide-react";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [companyName, setCompanyName] = useState("");
  const [npwp, setNpwp] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        if(data.company_name) setCompanyName(data.company_name);
        if(data.npwp) setNpwp(data.npwp);
        if(data.address) setAddress(data.address);
        if(data.email) setEmail(data.email);
        if(data.phone) setPhone(data.phone);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          npwp: npwp,
          address: address,
          email: email,
          phone: phone
        })
      });
      if(res.ok) alert("Pengaturan berhasil disimpan");
      else alert("Gagal menyimpan pengaturan");
    } catch(err) {
      console.error(err);
      alert("Terjadi kesalahan server");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat pengaturan...</div>;

  return (
    <div className="space-y-6 max-w-5xl" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi profil perusahaan dan preferensi aplikasi</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {[
              { id: "company", label: "Profil Perusahaan", icon: <Building2 size={18} /> },
              { id: "notifications", label: "Notifikasi", icon: <Bell size={18} /> },
              { id: "security", label: "Keamanan", icon: <Shield size={18} /> },
              { id: "finance", label: "Keuangan & Pajak", icon: <Wallet size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={activeTab === tab.id ? "text-blue-600" : "text-gray-400"}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          {activeTab === "company" && (
            <div className="p-6 space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Logo Perusahaan</h2>
                <p className="text-sm text-gray-500 mt-1">Logo ini akan muncul di invoice, laporan, dan dashboard.</p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Building2 size={32} />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <Upload size={16} /> Ganti Logo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900">Informasi Umum</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Nama Perusahaan</label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">NPWP</label>
                    <input value={npwp} onChange={e => setNpwp(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Alamat Lengkap</label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Kontak</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} type="text" onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ''); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Preferensi Notifikasi</h2>
                <p className="text-sm text-gray-500 mt-1">Pilih notifikasi apa saja yang ingin Anda terima.</p>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Approval Request", desc: "Notifikasi saat ada dokumen (PR, Invoice) yang membutuhkan persetujuan.", checked: true },
                  { title: "Project Alert", desc: "Notifikasi jika proyek mengalami keterlambatan atau overbudget.", checked: true },
                  { title: "Laporan Mingguan", desc: "Kirim ringkasan laporan proyek setiap hari Senin pagi.", checked: false },
                  { title: "Pembaruan Sistem", desc: "Pemberitahuan mengenai fitur baru dan pemeliharaan sistem.", checked: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="pt-0.5">
                      <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === "security" || activeTab === "finance") && (
            <div className="p-12 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === "security" ? <Shield size={32} /> : <Wallet size={32} />}
              </div>
              <h2 className="text-base font-medium text-gray-900 mb-2">Segera Hadir</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Pengaturan untuk modul ini sedang dalam tahap pengembangan dan akan segera tersedia.
              </p>
            </div>
          )}

          {/* Footer Save */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
            <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Save size={16} /> Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
