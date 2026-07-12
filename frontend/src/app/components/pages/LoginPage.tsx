import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Building2, HardHat } from "lucide-react";
import { useAuth, UserRole, getRoleDashboard } from "../../context/AuthContext";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "owner", label: "Owner", desc: "Full system access" },
  { value: "finance", label: "Finance Manager", desc: "Finance & invoicing" },
  { value: "purchasing", label: "Purchasing", desc: "Procurement management" },
  { value: "pm", label: "Project Manager", desc: "Project oversight" },
  { value: "mandor", label: "Mandor", desc: "Field operations" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("owner@constructerp.id");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const success = await login(username, password, remember);
    
    if (success) {
      const stored = localStorage.getItem("erp_user") || sessionStorage.getItem("erp_user");
      if (stored) {
        const u = JSON.parse(stored);
        navigate(getRoleDashboard(u.role));
      } else {
        navigate("/dashboard");
      }
    } else {
      setError("Username atau password salah");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    setForgotError("");

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setForgotMessage(data.message);
        if (data.previewUrl) {
          console.log("Mock Email URL:", data.previewUrl);
          // In development, we can optionally show the link or just rely on console
        }
      } else {
        setForgotError(data.message || "Gagal mengirim permintaan reset password.");
      }
    } catch (err) {
      setForgotError("Terjadi kesalahan jaringan.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left: Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/20 rounded-full"
              style={{
                width: `${(i + 1) * 60}px`,
                height: `${(i + 1) * 60}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-md">
          {/* SVG Illustration */}
          <svg viewBox="0 0 480 360" className="w-full max-w-md mx-auto mb-8" fill="none">
            {/* Ground */}
            <rect x="0" y="300" width="480" height="60" fill="rgba(255,255,255,0.1)" rx="4" />
            {/* Building skeleton */}
            <rect x="60" y="80" width="180" height="220" fill="rgba(255,255,255,0.15)" rx="4" />
            <rect x="70" y="90" width="40" height="50" fill="rgba(255,255,255,0.2)" rx="2" />
            <rect x="120" y="90" width="40" height="50" fill="rgba(255,255,255,0.2)" rx="2" />
            <rect x="170" y="90" width="40" height="50" fill="rgba(255,255,255,0.2)" rx="2" />
            <rect x="70" y="160" width="40" height="50" fill="rgba(255,255,255,0.2)" rx="2" />
            <rect x="120" y="160" width="40" height="50" fill="rgba(255,255,255,0.2)" rx="2" />
            <rect x="170" y="160" width="40" height="50" fill="rgba(255,255,255,0.2)" rx="2" />
            <rect x="70" y="230" width="40" height="70" fill="rgba(255,255,255,0.25)" rx="2" />
            <rect x="120" y="230" width="40" height="70" fill="rgba(255,255,255,0.25)" rx="2" />
            <rect x="170" y="230" width="40" height="70" fill="rgba(255,255,255,0.25)" rx="2" />
            {/* Crane */}
            <line x1="320" y1="300" x2="320" y2="40" stroke="rgba(255,255,255,0.6)" strokeWidth="6" strokeLinecap="round" />
            <line x1="200" y1="40" x2="420" y2="40" stroke="rgba(255,255,255,0.6)" strokeWidth="5" strokeLinecap="round" />
            <line x1="200" y1="40" x2="200" y2="80" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
            <line x1="280" y1="40" x2="280" y2="130" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 4" />
            {/* Hook */}
            <circle cx="280" cy="140" r="8" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" />
            {/* Workers */}
            {/* Worker 1 */}
            <circle cx="370" cy="270" r="14" fill="rgba(255,255,255,0.9)" />
            <rect x="358" y="285" width="24" height="30" fill="rgba(255,255,255,0.7)" rx="3" />
            <rect x="358" y="275" width="24" height="10" fill="#F59E0B" rx="2" />
            {/* Worker 2 */}
            <circle cx="420" cy="268" r="14" fill="rgba(255,255,255,0.9)" />
            <rect x="408" y="283" width="24" height="30" fill="rgba(255,255,255,0.7)" rx="3" />
            <rect x="408" y="273" width="24" height="10" fill="#F59E0B" rx="2" />
            {/* Blueprint */}
            <rect x="345" y="240" width="80" height="55" fill="rgba(255,255,255,0.2)" rx="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="355" y1="255" x2="415" y2="255" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="355" y1="265" x2="400" y2="265" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="355" y1="275" x2="415" y2="275" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="355" y1="285" x2="390" y2="285" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            {/* Scaffold */}
            <rect x="248" y="120" width="8" height="180" fill="rgba(255,255,255,0.3)" />
            <rect x="248" y="150" width="40" height="5" fill="rgba(255,255,255,0.3)" />
            <rect x="248" y="200" width="40" height="5" fill="rgba(255,255,255,0.3)" />
            <rect x="248" y="250" width="40" height="5" fill="rgba(255,255,255,0.3)" />
            <rect x="280" y="120" width="8" height="180" fill="rgba(255,255,255,0.3)" />
          </svg>

          <h2 className="text-2xl font-semibold text-white mb-3">
            Manage Your Projects Smarter
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Platform ERP terintegrasi untuk kontraktor profesional. Kelola proyek,
            anggaran, pembelian, dan laporan keuangan dalam satu sistem.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Active Projects", value: "24" },
              { label: "Total Revenue", value: "Rp 120M" },
              { label: "On-Time Rate", value: "87%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white font-semibold text-lg">{stat.value}</p>
                <p className="text-blue-200 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Construction ERP</h1>
              <p className="text-xs text-gray-500">Administration & Project Management System</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Selamat Datang</h2>
            <p className="text-sm text-gray-500 mt-1">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan username atau email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-600">Remember Me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login ke Sistem"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            ConstructERP v1.0 &copy; 2024 &mdash; All Rights Reserved
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang password.
            </p>

            {forgotMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                {forgotMessage}
              </div>
            )}
            
            {forgotError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {forgotError}
              </div>
            )}

            {!forgotMessage ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nama@email.com"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotMessage("");
                      setForgotError("");
                      setForgotEmail("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-70 flex items-center gap-2"
                  >
                    {forgotLoading ? "Mengirim..." : "Kirim Link Reset"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMessage("");
                    setForgotError("");
                    setForgotEmail("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
