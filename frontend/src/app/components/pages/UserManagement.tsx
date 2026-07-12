import { useState } from "react";
import { UserRole } from "../../context/AuthContext";
import { Plus, Search, MoreVertical, Edit2, Trash2, Mail, Shield, Circle } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  lastLogin: string;
}

const MOCK_USERS: UserData[] = [
  { id: "USR-001", name: "Ahmad Fauzi", email: "owner@constructerp.id", role: "owner", status: "active", lastLogin: "2026-07-07 08:30" },
  { id: "USR-002", name: "Dewi Rahayu", email: "finance@constructerp.id", role: "finance", status: "active", lastLogin: "2026-07-06 14:15" },
  { id: "USR-003", name: "Hendra Wijaya", email: "purchasing@constructerp.id", role: "purchasing", status: "active", lastLogin: "2026-07-07 09:10" },
  { id: "USR-004", name: "Budi Santoso", email: "pm@constructerp.id", role: "pm", status: "active", lastLogin: "2026-07-06 17:45" },
  { id: "USR-005", name: "Agus Salim", email: "mandor@constructerp.id", role: "mandor", status: "active", lastLogin: "2026-07-07 07:05" },
  { id: "USR-006", name: "Sarah Amelia", email: "sarah.finance@constructerp.id", role: "finance", status: "inactive", lastLogin: "2026-06-20 11:20" },
];

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  finance: "Finance Manager",
  purchasing: "Purchasing",
  pm: "Project Manager",
  mandor: "Mandor",
};

const ROLE_COLORS: Record<UserRole, string> = {
  owner: "bg-purple-100 text-purple-700",
  finance: "bg-blue-100 text-blue-700",
  purchasing: "bg-amber-100 text-amber-700",
  pm: "bg-indigo-100 text-indigo-700",
  mandor: "bg-green-100 text-green-700",
};

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akses dan peran pengguna sistem</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Semua Peran</option>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Pengguna</th>
                <th className="px-6 py-4 font-medium">Peran</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Aktivitas Terakhir</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                        {user.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                      <Shield size={12} /> {ROLE_LABELS[user.role]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      <Circle size={8} className={user.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'} />
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada pengguna yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal Mock */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tambah Pengguna Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Masukkan nama" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="email@perusahaan.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Peran Akses</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="">Pilih peran</option>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
