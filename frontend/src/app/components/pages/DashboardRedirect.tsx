import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth, getRoleDashboard } from "../../context/AuthContext";

export function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
