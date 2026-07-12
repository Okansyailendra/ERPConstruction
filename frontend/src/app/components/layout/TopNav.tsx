import { useState } from "react";
import { Search, Bell, ChevronDown, Settings, LogOut, User, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

interface TopNavProps {
  breadcrumb: { label: string; path?: string }[];
}

const NOTIFICATIONS = [
  { id: 1, type: "success", message: "Invoice INV-2024-001 telah dibayar", time: "5 menit lalu", read: false },
  { id: 2, type: "warning", message: "Purchase Request PR-2024-004 menunggu approval", time: "1 jam lalu", read: false },
  { id: 3, type: "info", message: "Deadline PRJ-004 mendekati: 30 Sep 2025", time: "3 jam lalu", read: false },
  { id: 4, type: "success", message: "Material Beton K-300 telah diterima", time: "Kemarin", read: true },
  { id: 5, type: "warning", message: "Stok Keramik 60x60 habis (out of stock)", time: "Kemarin", read: true },
];

export function TopNav({ breadcrumb }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Breadcrumb */}
      <nav className="flex-1 flex items-center gap-1 text-sm">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-400">/</span>}
            <span className={i === breadcrumb.length - 1 ? "text-gray-900 font-medium" : "text-gray-400"}>
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari proyek, material..."
          className="w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
          className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
              <span className="text-xs text-blue-600 cursor-pointer">Tandai semua dibaca</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {NOTIFICATIONS.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 cursor-pointer ${!notif.read ? "bg-blue-50/40" : ""}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notif.type === "success" && <CheckCircle size={16} className="text-green-500" />}
                    {notif.type === "warning" && <AlertCircle size={16} className="text-amber-500" />}
                    {notif.type === "info" && <Clock size={16} className="text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
            <div className="px-4 py-2 text-center">
              <span className="text-xs text-blue-600 cursor-pointer">Lihat semua notifikasi</span>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{user?.avatar}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {showProfile && (
          <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <User size={15} /> My Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Settings size={15} /> Settings
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
