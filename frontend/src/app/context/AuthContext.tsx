import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "owner" | "finance" | "purchasing" | "pm" | "mandor";

interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
}

const USERS: Record<UserRole, User> = {
  owner: { name: "Ahmad Fauzi", email: "owner@constructerp.id", role: "owner", avatar: "AF" },
  finance: { name: "Dewi Rahayu", email: "finance@constructerp.id", role: "finance", avatar: "DR" },
  purchasing: { name: "Hendra Wijaya", email: "purchasing@constructerp.id", role: "purchasing", avatar: "HW" },
  pm: { name: "Budi Santoso", email: "pm@constructerp.id", role: "pm", avatar: "BS" },
  mandor: { name: "Agus Salim", email: "mandor@constructerp.id", role: "mandor", avatar: "AS" },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("erp_user") || sessionStorage.getItem("erp_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        if (remember) localStorage.setItem("erp_user", JSON.stringify(data.user));
        else sessionStorage.setItem("erp_user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("erp_user");
    sessionStorage.removeItem("erp_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function getRoleDashboard(role: UserRole): string {
  const map: Record<UserRole, string> = {
    owner: "/dashboard/owner",
    finance: "/dashboard/finance",
    purchasing: "/dashboard/purchasing",
    pm: "/dashboard/pm",
    mandor: "/dashboard/mandor",
  };
  return map[role];
}
