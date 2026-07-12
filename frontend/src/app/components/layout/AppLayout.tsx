import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useLocation } from "react-router";

const BREADCRUMB_MAP: Record<string, { label: string; parent?: string }> = {
  "/dashboard/owner": { label: "Owner Dashboard", parent: "Dashboard" },
  "/dashboard/finance": { label: "Finance Dashboard", parent: "Dashboard" },
  "/dashboard/purchasing": { label: "Purchasing Dashboard", parent: "Dashboard" },
  "/dashboard/pm": { label: "Project Manager Dashboard", parent: "Dashboard" },
  "/dashboard/mandor": { label: "Mandor Dashboard", parent: "Dashboard" },
  "/projects": { label: "Daftar Proyek", parent: "Projects" },
  "/projects/add": { label: "Tambah Proyek", parent: "Projects" },
  "/rab": { label: "Smart RAB Generator", parent: "RAB" },
  "/purchasing": { label: "Purchasing Management", parent: "Purchasing" },
  "/execution": { label: "Project Execution", parent: "Execution" },
  "/invoice": { label: "Invoice Management", parent: "Finance" },
  "/cashflow": { label: "Cashflow", parent: "Finance" },
  "/profit": { label: "Profit Analysis", parent: "Finance" },
  "/finance": { label: "Finance Dashboard", parent: "Finance" },
  "/master-material": { label: "Master Material", parent: "Master Data" },
  "/master-ahsp": { label: "Master AHSP", parent: "Master Data" },
  "/reports": { label: "Reports", parent: "Reports" },
  "/users": { label: "User Management", parent: "Admin" },
  "/settings": { label: "Settings", parent: "Admin" },
};

function getBreadcrumb(path: string) {
  const info = BREADCRUMB_MAP[path];
  if (!info) return [{ label: "Home" }];
  const crumbs = [{ label: "Home" }];
  if (info.parent) crumbs.push({ label: info.parent });
  crumbs.push({ label: info.label });
  return crumbs;
}

export function AppLayout() {
  const location = useLocation();
  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FA]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
