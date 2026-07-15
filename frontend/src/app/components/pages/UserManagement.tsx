import { useState, useEffect } from "react";
import { UserRole } from "../../context/AuthContext";
import { Plus, Search, MoreVertical, Edit2, Trash2, Mail, Shield, Circle, Save, X } from "lucide-react";

interface UserData {
  id: string;
  db_id?: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  finance: "Finance Manager",
  purchasing: "Purchasing",
  pm: "Project Manager",
  mandor: "Mandor",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-100 text-purple-700",
  finance: "bg-blue-100 text-blue-700",
  purchasing: "bg-amber-100 text-amber-700",
  pm: "bg-indigo-100 text-indigo-700",
  mandor: "bg-green-100 text-green-700",
};

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("pm");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  const fetchUsers = () => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user: UserData | null = null) => {
    if (user) {
      setUserToEdit(user);
      setFormName(user.name);
      setFormEmail(user.email);
      setFormRole(user.role);
      setFormStatus(user.status);
    } else {
      setUserToEdit(null);
      setFormName("");
      setFormEmail("");
      setFormRole("pm");
      setFormStatus("active");
    }
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formEmail || !formRole) {
      alert("Harap lengkapi semua field");
      return;
    }
    const payload = {
      name: formName,
      email: formEmail,
      role: formRole,
      status: formStatus
    };

    try {
      let res;
      if (userToEdit) {
        res = await fetch(`http://localhost:5000/api/users/${userToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        fetchUsers();
        setIsAddModalOpen(false);
      } else {
        alert("Gagal menyimpan pengguna");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan server");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchUsers();
      else alert("Gagal menghapus pengguna");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan server");
    }
  };

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
          onClick={() => openModal()}
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
                        {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
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
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                      <Shield size={12} /> {ROLE_LABELS[user.role] || user.role.toUpperCase()}
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
                      <button onClick={() => openModal(user)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Hapus">
                        <Trash2 size={16} />
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

      {/* Add/Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{userToEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Masukkan nama" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input value={formEmail} onChange={e => setFormEmail(e.target.value)} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="email@perusahaan.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Peran Akses</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value as "active"|"inactive")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                <Save size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
