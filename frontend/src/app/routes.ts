import { createBrowserRouter, redirect } from "react-router";
import { createElement } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./components/pages/LoginPage";
import { ResetPasswordPage } from "./components/pages/ResetPasswordPage";
import { DashboardRedirect } from "./components/pages/DashboardRedirect";
import { OwnerDashboard } from "./components/pages/OwnerDashboard";
import { FinanceDashboard } from "./components/pages/FinanceDashboard";
import { PurchasingDashboard } from "./components/pages/PurchasingDashboard";
import { ProjectManagerDashboard } from "./components/pages/ProjectManagerDashboard";
import { MandorDashboard } from "./components/pages/MandorDashboard";
import { ProjectList } from "./components/pages/ProjectList";
import { AddProject } from "./components/pages/AddProject";
import { SmartRAB } from "./components/pages/SmartRAB";
import { PurchasingManagement } from "./components/pages/PurchasingManagement";
import { ProjectExecution } from "./components/pages/ProjectExecution";
import { InvoiceManagement } from "./components/pages/InvoiceManagement";
import { Cashflow } from "./components/pages/Cashflow";
import { ProjectProfit } from "./components/pages/ProjectProfit";
import { MasterMaterial } from "./components/pages/MasterMaterial";
import { MasterAHSP } from "./components/pages/MasterAHSP";
import { Reports } from "./components/pages/Reports";
import { UserManagement } from "./components/pages/UserManagement";
import { SettingsPage } from "./components/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/reset-password/:token",
    Component: ResetPasswordPage,
  },
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, loader: () => redirect("/dashboard") },
      { path: "dashboard", Component: DashboardRedirect },
      { path: "dashboard/owner", Component: OwnerDashboard },
      { path: "dashboard/finance", Component: FinanceDashboard },
      { path: "dashboard/purchasing", Component: PurchasingDashboard },
      { path: "dashboard/pm", Component: ProjectManagerDashboard },
      { path: "dashboard/mandor", Component: MandorDashboard },
      { path: "projects", Component: ProjectList },
      { path: "projects/add", Component: AddProject },
      { path: "projects/edit/:id", Component: AddProject },
      { path: "rab", Component: SmartRAB },
      { path: "purchasing", Component: PurchasingManagement },
      { path: "execution", Component: ProjectExecution },
      { path: "finance", Component: FinanceDashboard },
      { path: "invoice", Component: InvoiceManagement },
      { path: "cashflow", Component: Cashflow },
      { path: "profit", Component: ProjectProfit },
      { path: "master-material", Component: MasterMaterial },
      { path: "master-ahsp", Component: MasterAHSP },
      { path: "reports", Component: Reports },
      { path: "users", Component: UserManagement },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
