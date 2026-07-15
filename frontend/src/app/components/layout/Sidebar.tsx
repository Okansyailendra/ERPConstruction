import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard, FolderKanban, Package, BookOpen,
  FileSpreadsheet, ShoppingCart, Hammer, CreditCard,
  BarChart3, Users, Settings, ChevronLeft, ChevronRight,
  Building2, LogOut, DollarSign,
} from "lucide-react";
import { useAuth, UserRole } from "../../context/AuthContext";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard", roles: ["owner", "finance", "purchasing", "pm", "mandor"] },
  { label: "Projects", icon: <FolderKanban size={18} />, path: "/projects", roles: ["owner", "pm", "purchasing"] },
  { label: "Master Material", icon: <Package size={18} />, path: "/master-material", roles: ["owner", "purchasing"] },
  { label: "Master AHSP", icon: <BookOpen size={18} />, path: "/master-ahsp", roles: ["owner", "pm"] },
  { label: "RAB", icon: <FileSpreadsheet size={18} />, path: "/rab", roles: ["owner", "pm"] },
  { label: "Purchasing", icon: <ShoppingCart size={18} />, path: "/purchasing", roles: ["owner", "purchasing", "finance"] },
  { label: "Execution", icon: <Hammer size={18} />, path: "/execution", roles: ["owner", "pm", "mandor"] },
  { label: "Finance", icon: <DollarSign size={18} />, path: "/finance", roles: ["owner", "finance"] },
  { label: "Invoice", icon: <CreditCard size={18} />, path: "/invoice", roles: ["owner", "finance"] },
  { label: "Cashflow", icon: <BarChart3 size={18} />, path: "/cashflow", roles: ["owner", "finance"] },
  { label: "Profit Analysis", icon: <BarChart3 size={18} />, path: "/profit", roles: ["owner", "finance"] },
  { label: "Reports", icon: <BarChart3 size={18} />, path: "/reports", roles: ["owner", "finance", "pm"] },
  { label: "Users", icon: <Users size={18} />, path: "/users", roles: ["owner"] },
  { label: "Settings", icon: <Settings size={18} />, path: "/settings", roles: ["owner"] },
];

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  finance: "Finance Manager",
  purchasing: "Purchasing",
  pm: "Project Manager",
  mandor: "Mandor",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = user
    ? NAV_ITEMS.filter((item) => item.roles.includes(user.role)).map((item) =>
        item.path === "/dashboard"
          ? { ...item, path: `/dashboard/${user.role === "pm" ? "pm" : user.role}` }
          : item
      )
    : [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      } flex-shrink-0 h-full`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 min-h-[64px]">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 leading-tight whitespace-nowrap">ERP Construction</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-gray-200 p-3">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{user.avatar}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
