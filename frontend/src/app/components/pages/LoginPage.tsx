import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Building2, HardHat, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse-ring {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
          }
          
          /* Dynamic Animations for Illustration */
          @keyframes cargo-lift {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(30px); }
          }
          @keyframes build-up {
            0% { opacity: 0; transform: translateY(40px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pop-in {
            0%, 15% { transform: scale(0); opacity: 0; }
            25% { transform: scale(1.2); opacity: 1; }
            35%, 85% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          @keyframes pulse-slow-opacity {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.8; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 2s; }
          .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { animation: fade-in 1s ease-out forwards; }
          .animate-pulse-ring { animation: pulse-ring 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          
          .animate-cargo-lift { animation: cargo-lift 5s ease-in-out infinite; }
          .animate-build-up { animation: build-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-pop-in { animation: pop-in 6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; }
          .animate-pulse-slow-opacity { animation: pulse-slow-opacity 3s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 20s linear infinite; }
          .animate-spin-slow-reverse { animation: spin-slow 25s linear infinite reverse; }

          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-400 { animation-delay: 400ms; }
          .delay-500 { animation-delay: 500ms; }
          .opacity-0 { opacity: 0; }
        `}
      </style>

      {/* Left: Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
          
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-blue-400/20 rounded-full animate-pulse-ring"
              style={{
                width: `${(i + 1) * 300}px`,
                height: `${(i + 1) * 300}px`,
                top: "50%",
                left: "50%",
                animationDelay: `${i * 1.5}s`
              }}
            />
          ))}
          
          {/* Decorative glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg">
          {/* SVG Illustration - Now with Float Animation */}
          {/* Dynamic Animated Illustration */}
          <div className="mb-12 relative w-full max-w-md mx-auto h-[320px] flex items-center justify-center">
            <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl overflow-visible" fill="none">
              {/* Animated dashed background circles */}
              <circle cx="200" cy="150" r="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 6" className="animate-spin-slow origin-center" />
              <circle cx="200" cy="150" r="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow-reverse origin-center" />

              {/* Base Platform */}
              <rect x="40" y="250" width="320" height="20" fill="rgba(255,255,255,0.08)" rx="4" />
              <rect x="60" y="246" width="280" height="4" fill="rgba(255,255,255,0.15)" rx="2" />
              
              {/* Building */}
              <g className="animate-build-up">
                <rect x="70" y="90" width="130" height="156" fill="rgba(255,255,255,0.1)" rx="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                {/* Windows with random pulse */}
                {[0, 1, 2].map((row) => (
                  [0, 1, 2].map((col) => (
                    <rect 
                      key={`win-${row}-${col}`} 
                      x={85 + col * 35} 
                      y={105 + row * 45} 
                      width="26" 
                      height="32" 
                      fill="rgba(255,255,255,0.15)" 
                      rx="4"
                      className="animate-pulse-slow-opacity"
                      style={{ animationDelay: `${(row * 0.5) + (col * 0.3)}s`, animationDuration: `${2 + (row * 0.5)}s` }}
                    />
                  ))
                ))}
              </g>

              {/* Crane Tower */}
              <rect x="235" y="50" width="6" height="196" fill="rgba(255,255,255,0.4)" rx="3" />
              {/* Crane Arm */}
              <rect x="140" y="50" width="160" height="6" fill="rgba(255,255,255,0.4)" rx="3" />
              
              {/* Crane Cable */}
              <line x1="235" y1="53" x2="150" y2="85" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

              {/* Animated Cargo Assembly */}
              <g className="animate-cargo-lift">
                {/* Vertical Cable */}
                <line x1="180" y1="56" x2="180" y2="130" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                
                {/* Hook */}
                <path d="M175 130 L185 130 L180 120 Z" fill="rgba(255,255,255,0.6)" />
                <circle cx="180" cy="115" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
                <path d="M165" y="140" x2="195" y2="140" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                
                {/* Blue Cargo Container */}
                <rect x="155" y="140" width="50" height="30" fill="#3B82F6" rx="4" />
                <rect x="160" y="145" width="40" height="4" fill="rgba(255,255,255,0.2)" rx="2" />
              </g>

              {/* Scaffolding/Ladder */}
              <g className="animate-fade-in delay-500 opacity-0">
                <rect x="210" y="146" width="2" height="100" fill="rgba(255,255,255,0.3)" />
                <rect x="226" y="146" width="2" height="100" fill="rgba(255,255,255,0.3)" />
                {[0, 1, 2, 3, 4].map((step) => (
                  <line 
                    key={`step-${step}`} 
                    x1="210" 
                    y1={160 + step * 20} 
                    x2="228" 
                    y2={150 + step * 20} 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth="1.5" 
                  />
                ))}
              </g>

              {/* Floating UI Card with Checkmark */}
              <g className="animate-float" style={{ transformOrigin: '280px 150px' }}>
                <rect x="260" y="120" width="100" height="70" fill="rgba(255,255,255,0.15)" rx="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" className="backdrop-blur-md" />
                <rect x="272" y="135" width="35" height="6" fill="rgba(255,255,255,0.5)" rx="3" />
                <rect x="272" y="152" width="75" height="4" fill="rgba(255,255,255,0.2)" rx="2" />
                <rect x="272" y="162" width="55" height="4" fill="rgba(255,255,255,0.2)" rx="2" />
                
                {/* Pop-in Checkmark */}
                <g className="animate-pop-in" style={{ transformOrigin: '335px 165px' }}>
                  <circle cx="335" cy="165" r="12" fill="#10B981" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                  <path d="M329 165 L333 169 L341 161" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              </g>

              {/* Sparkles / Particles */}
              {[...Array(6)].map((_, i) => (
                <circle 
                  key={`sparkle-${i}`}
                  cx={80 + Math.random() * 240} 
                  cy={40 + Math.random() * 160} 
                  r="1.5" 
                  fill="white" 
                  className="animate-pulse-slow-opacity"
                  style={{ animationDelay: `${Math.random() * 2}s`, animationDuration: `${Math.random() * 2 + 1}s` }}
                />
              ))}
            </svg>
          </div>

          <div className="animate-fade-in-up opacity-0 delay-100">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Manage Your Projects Smarter
            </h2>
            <p className="text-blue-100/90 text-base leading-relaxed mb-10 max-w-md mx-auto">
              Platform ERP terintegrasi untuk kontraktor profesional. Kelola proyek,
              anggaran, pembelian, dan laporan keuangan dalam satu sistem.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {[
              { label: "Active Projects", value: "24", icon: "🏢" },
              { label: "Total Revenue", value: "Rp 120M", icon: "💰" },
              { label: "On-Time Rate", value: "87%", icon: "⏱️" },
            ].map((stat, idx) => (
              <div 
                key={stat.label} 
                className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center transform hover:-translate-y-2 hover:bg-white/20 transition-all duration-300 animate-fade-in-up opacity-0 delay-${(idx + 2) * 100}`}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-blue-200 text-xs font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 bg-white relative">
        {/* Subtle background decoration for right side */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-3xl"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-50/50 blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in-up opacity-0 delay-300">
          <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform duration-300">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Construction ERP</h1>
                <p className="text-xs text-gray-500 font-medium">Administration & Project Management</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-sm text-gray-500 mt-2">Masuk ke akun Anda untuk melanjutkan ke sistem</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3 animate-fade-in">
                <div className="mt-0.5">⚠️</div>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username / Email
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all duration-300"
                    placeholder="Masukkan username atau email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all duration-300 pr-12"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200"></div>
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember Me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Login ke Sistem
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs font-medium text-gray-400 mt-8">
            ConstructERP &copy; 2026 &mdash; All Rights Reserved
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Masukkan email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang password.
            </p>

            {forgotMessage && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 flex items-start gap-3">
                <div className="mt-0.5">✅</div>
                <div>{forgotMessage}</div>
              </div>
            )}
            
            {forgotError && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                <div className="mt-0.5">⚠️</div>
                <div>{forgotError}</div>
              </div>
            )}

            {!forgotMessage ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-300"
                    placeholder="nama@email.com"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotMessage("");
                      setForgotError("");
                      setForgotEmail("");
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-70 flex items-center gap-2 transition-colors shadow-md shadow-blue-500/20"
                  >
                    {forgotLoading ? "Mengirim..." : "Kirim Link"}
                  </button>
                </div>
              </form>
            ) : (
               <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMessage("");
                    setForgotError("");
                    setForgotEmail("");
                  }}
                  className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-500/20"
                >
                  Kembali ke Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
