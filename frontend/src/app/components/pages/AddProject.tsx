import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Check, ChevronRight, Upload, Zap, Building2, User, Mail, Phone, MapPin, DollarSign, Calendar, Info, Layers, Loader2 } from "lucide-react";
import { useProjects } from "../../hooks/useProjects";

const STEPS = [
  { id: 1, label: "Info Proyek", icon: <Info size={16} /> },
  { id: 2, label: "Detail Teknis", icon: <Layers size={16} /> },
  { id: 3, label: "Pembayaran", icon: <DollarSign size={16} /> },
  { id: 4, label: "Lingkup Kerja", icon: <Building2 size={16} /> },
  { id: 5, label: "Dokumen", icon: <Upload size={16} /> },
];

export function AddProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { projects, addProject, updateProject } = useProjects();
  const [step, setStep] = useState(1);
  const [paymentScheme, setPaymentScheme] = useState<string[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingRAB, setIsGeneratingRAB] = useState(false);
  const [aiLoadingText, setAiLoadingText] = useState("Menyimpan spesifikasi proyek...");
  const [formData, setFormData] = useState({
    name: "",
    customer: "",
    company: "",
    email: "",
    phone: "",
    type: "Commercial",
    area: 0,
    floors: 1,
    materialClass: "Standard",
    laborType: "Contract",
    locationCondition: "Mudah (akses jalan baik)",
    pm: "Budi Santoso",
    location: "",
    contractValue: 0,
    dp: 0,
    status: "active",
    startDate: "",
    deadline: "",
  });

  // Load existing data if edit mode
  useEffect(() => {
    if (id && projects.length > 0) {
      const existing = projects.find(p => p.id === id);
      if (existing) {
        setFormData({
          name: existing.name || "",
          customer: existing.customer || "",
          company: existing.company || "",
          email: existing.email || "", 
          phone: existing.phone || "",
          type: existing.type || "Commercial",
          area: existing.area || 0,
          floors: existing.floors || 1,
          materialClass: existing.materialClass || "Standard",
          laborType: existing.laborType || "Contract",
          locationCondition: existing.locationCondition || "Mudah (akses jalan baik)",
          pm: existing.pm || "Budi Santoso",
          location: existing.location || "",
          contractValue: existing.contractValue || 0,
          dp: existing.dp || 0,
          status: existing.status || "active",
          startDate: existing.startDate || "",
          deadline: existing.deadline || "",
        });
        if (existing.paymentScheme) setPaymentScheme(existing.paymentScheme);
        if (existing.scopes) setScopes(existing.scopes);
        if (existing.uploadedFiles) setUploadedFiles(existing.uploadedFiles);
      }
    }
  }, [id, projects]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = "Wajib diisi";
      if (!formData.customer) newErrors.customer = "Wajib diisi";
      if (!formData.email) newErrors.email = "Wajib diisi";
      if (!formData.phone) newErrors.phone = "Wajib diisi";
      if (!formData.type) newErrors.type = "Wajib dipilih";
    } else if (currentStep === 2) {
      if (!formData.area || formData.area <= 0) newErrors.area = "Wajib diisi";
      if (!formData.location) newErrors.location = "Wajib diisi";
      if (!formData.contractValue || formData.contractValue <= 0) newErrors.contractValue = "Wajib diisi";
      if (!formData.dp || formData.dp <= 0) newErrors.dp = "Wajib diisi";
      if (!formData.startDate) newErrors.startDate = "Wajib diisi";
      if (!formData.deadline) newErrors.deadline = "Wajib diisi";
    } else if (currentStep === 5) {
      if (!uploadedFiles['blueprint']) newErrors.blueprint = "Blueprint wajib diunggah";
      if (!uploadedFiles['contract']) newErrors.contract = "Dokumen kontrak wajib diunggah";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;
    if (name === 'phone') {
      finalValue = value.replace(/\D/g, '');
    } else if (name === 'contractValue' || name === 'dp') {
      const digits = value.replace(/\D/g, '');
      finalValue = digits ? Number(digits) : 0;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => ({ ...prev, [key]: e.target.files![0].name }));
      if (errors[key]) {
        setErrors(prev => {
          const newErr = { ...prev };
          delete newErr[key];
          return newErr;
        });
      }
    }
  };

  const togglePayment = (val: string) => {
    setPaymentScheme((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const toggleScope = (val: string) => {
    setScopes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const getProjectPayload = () => {
    const val = Number(formData.contractValue);
    return {
      name: formData.name || "Proyek Baru",
      customer: formData.customer || "Customer",
      company: formData.company || "Perusahaan",
      type: formData.type || "Commercial",
      pm: formData.pm || "Budi Santoso",
      budget: val * 0.8 || 100000000,
      contractValue: val || 120000000,
      dp: Number(formData.dp) || 0,
      progress: 0,
      deadline: formData.deadline || "2026-12-31",
      startDate: formData.startDate || "2026-07-07",
      status: formData.status,
      location: formData.location || "Lokasi",
      floors: Number(formData.floors) || 1,
      area: Number(formData.area) || 0,
      materialClass: formData.materialClass,
      laborType: formData.laborType,
      paymentScheme,
      scopes,
      uploadedFiles,
      materialCost: val * 0.4 || 40000000,
      laborCost: val * 0.25 || 25000000,
      equipmentCost: val * 0.1 || 10000000,
      operationalCost: val * 0.05 || 5000000,
    };
  };

  const handleSaveProject = async () => {
    setIsSubmitting(true);
    const newProject = getProjectPayload();
    
    let success = false;
    if (id) {
      success = await updateProject(id, newProject);
    } else {
      success = await addProject(newProject);
    }
    
    setIsSubmitting(false);
    if(success !== false) {
      navigate("/projects");
    } else {
      alert("Gagal menyimpan proyek. Periksa koneksi server Anda.");
    }
  };

  const handleGenerateRAB = async () => {
    if (!validateStep(step)) return;
    
    setIsGeneratingRAB(true);
    setAiLoadingText("Menyimpan spesifikasi proyek...");
    
    const newProject = getProjectPayload();
    let projectCode = id;
    
    if (id) {
      await updateProject(id, newProject);
    } else {
      projectCode = await addProject(newProject);
    }
    
    if (projectCode) {
      setAiLoadingText("AI sedang menghitung estimasi RAB...");
      try {
        await fetch('http://localhost:5000/api/rabs/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: projectCode, parameters: formData })
        });
        
        // Wait a bit to simulate AI processing for user experience
        setTimeout(() => {
          navigate(`/rab?generatedFor=${projectCode}`);
        }, 1500);
      } catch (err) {
        console.error(err);
        alert("Gagal men-generate RAB.");
        setIsGeneratingRAB(false);
      }
    } else {
      alert("Gagal menyimpan proyek.");
      setIsGeneratingRAB(false);
    }
  };

  const getInputClass = (name: string) => `w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200`;
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const ErrorMsg = ({ name }: { name: string }) => errors[name] ? <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors[name]}</p> : null;

  return (
    <div className="max-w-5xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header with gradient text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600">
            {id ? "Edit Proyek" : "Tambah Proyek Baru"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {id ? "Perbarui informasi proyek di bawah ini." : "Isi formulir berikut untuk mendaftarkan proyek baru ke sistem."}
          </p>
        </div>
        <button onClick={() => navigate("/projects")} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm">
          Batal & Kembali
        </button>
      </div>

      {/* Premium Step Indicator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pt-6 px-6 pb-10 mb-8">
        <div className="relative flex items-center justify-between w-full">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} 
          />
          
          {STEPS.map((s, i) => {
            const isCompleted = s.id < step;
            const isActive = s.id === step;
            return (
              <div key={s.id} className="relative flex flex-col items-center group cursor-pointer" onClick={() => { if (s.id < step) setStep(s.id); }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                  isCompleted ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 scale-100" :
                  isActive ? "bg-white border-2 border-blue-600 text-blue-600 shadow-lg shadow-blue-600/20 scale-110" : 
                  "bg-white border-2 border-gray-200 text-gray-400 scale-100 hover:border-gray-300"
                }`}>
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : s.icon}
                </div>
                <div className={`absolute -bottom-7 whitespace-nowrap text-xs font-semibold transition-colors duration-300 ${
                  isActive ? "text-blue-700" : isCompleted ? "text-gray-700" : "text-gray-400"
                }`}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Wrapper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px] transition-all duration-300 pb-12">
        
        {/* Step 1: Project Information */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Info size={16} /></span>
              Informasi Umum Proyek
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div className="md:col-span-2 relative">
                <label className={labelClass}>Nama Proyek <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                  <input name="name" value={formData.name} onChange={handleChange} className={getInputClass("name")} placeholder="Contoh: Gedung Perkantoran Sudirman" />
                </div>
                <ErrorMsg name="name" />
              </div>
              
              <div className="relative">
                <label className={labelClass}>Nama Klien / Customer <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.customer ? 'text-red-400' : 'text-gray-400'}`} />
                  <input name="customer" value={formData.customer} onChange={handleChange} className={getInputClass("customer")} placeholder="Nama lengkap klien" />
                </div>
                <ErrorMsg name="customer" />
              </div>
              
              <div className="relative">
                <label className={labelClass}>Perusahaan Klien</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="company" value={formData.company} onChange={handleChange} className={getInputClass("company")} placeholder="Nama perusahaan klien" />
                </div>
              </div>

              <div className="relative">
                <label className={labelClass}>Email Kontak <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className={getInputClass("email")} placeholder="email@perusahaan.com" />
                </div>
                <ErrorMsg name="email" />
              </div>

              <div className="relative">
                <label className={labelClass}>Nomor Telepon <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                  <input name="phone" value={formData.phone} onChange={handleChange} className={getInputClass("phone")} placeholder="08xxxxxxxxxx" />
                </div>
                <ErrorMsg name="phone" />
              </div>

              <div className="md:col-span-2 relative">
                <label className={labelClass}>Tipe Proyek <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {["Residential", "Commercial", "Renovation", "Interior", "Infrastructure"].map((type) => (
                    <button 
                      key={type} 
                      onClick={() => {
                        setFormData(prev => ({...prev, type}));
                        if(errors.type) {
                          setErrors(prev => { const e = {...prev}; delete e.type; return e; });
                        }
                      }} 
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.type === type 
                          ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm shadow-blue-100" 
                          : errors.type ? "border-red-300 text-red-500" : "border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.type && <p className="text-red-500 text-xs mt-2 absolute -bottom-5">{errors.type}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Project Detail */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><Layers size={16} /></span>
              Spesifikasi Teknis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
              
              <div className="relative">
                <label className={labelClass}>Luas Bangunan (m²) <span className="text-red-500">*</span></label>
                <input name="area" type="number" value={formData.area} onChange={handleChange} className={`${getInputClass("area")} !pl-4`} placeholder="0" />
                <ErrorMsg name="area" />
              </div>
              <div className="relative">
                <label className={labelClass}>Jumlah Lantai</label>
                <input name="floors" type="number" value={formData.floors} onChange={handleChange} className={`${getInputClass("floors")} !pl-4`} placeholder="1" />
              </div>
              <div className="relative">
                <label className={labelClass}>Kelas Material</label>
                <select name="materialClass" value={formData.materialClass} onChange={handleChange} className={`${getInputClass("materialClass")} !pl-4 appearance-none`}>
                  <option>Economy</option><option>Standard</option><option>Premium</option>
                </select>
              </div>

              <div className="relative">
                <label className={labelClass}>Tipe Tenaga Kerja</label>
                <select name="laborType" value={formData.laborType} onChange={handleChange} className={`${getInputClass("laborType")} !pl-4 appearance-none`}>
                  <option>Daily (Harian)</option><option>Contract (Borongan)</option>
                </select>
              </div>
              <div className="relative">
                <label className={labelClass}>Kondisi Lokasi</label>
                <select name="locationCondition" value={formData.locationCondition} onChange={handleChange} className={`${getInputClass("locationCondition")} !pl-4 appearance-none`}>
                  <option>Mudah (akses jalan baik)</option>
                  <option>Sedang (akses terbatas)</option>
                  <option>Sulit (remote/terpencil)</option>
                </select>
              </div>
              <div className="relative">
                <label className={labelClass}>Project Manager</label>
                <select name="pm" value={formData.pm} onChange={handleChange} className={`${getInputClass("pm")} !pl-4 appearance-none`}>
                  <option>Budi Santoso</option><option>Andi Pratama</option><option>Reza Firmansyah</option>
                </select>
              </div>

              <div className="md:col-span-3 relative">
                <label className={labelClass}>Alamat Proyek <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin size={18} className={`absolute left-3.5 top-3.5 ${errors.location ? 'text-red-400' : 'text-gray-400'}`} />
                  <textarea name="location" value={formData.location} onChange={handleChange} className={`${getInputClass("location")} resize-none`} rows={3} placeholder="Alamat lengkap lokasi proyek" />
                </div>
                <ErrorMsg name="location" />
              </div>

              <div className="relative">
                <label className={labelClass}>Nilai Kontrak (Rp) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium ${errors.contractValue ? 'text-red-400' : 'text-gray-500'}`}>Rp</span>
                  <input name="contractValue" type="text" value={formData.contractValue ? formData.contractValue.toLocaleString('id-ID') : ''} onChange={handleChange} className={`${getInputClass("contractValue")} !pl-10`} placeholder="0" />
                </div>
                <ErrorMsg name="contractValue" />
              </div>
              <div className="relative">
                <label className={labelClass}>Uang Muka / DP (Rp) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium ${errors.dp ? 'text-red-400' : 'text-gray-500'}`}>Rp</span>
                  <input name="dp" type="text" value={formData.dp ? formData.dp.toLocaleString('id-ID') : ''} onChange={handleChange} className={`${getInputClass("dp")} !pl-10`} placeholder="0" />
                </div>
                <ErrorMsg name="dp" />
              </div>
              <div className="relative">
                <label className={labelClass}>Status Proyek</label>
                <select name="status" value={formData.status} onChange={handleChange} className={`${getInputClass("status")} !pl-4 appearance-none`}>
                  <option value="Planning">Planning</option><option value="active">Active</option><option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="md:col-span-1 relative">
                <label className={labelClass}>Tanggal Mulai <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.startDate ? 'text-red-400' : 'text-gray-400'}`} />
                  <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className={getInputClass("startDate")} />
                </div>
                <ErrorMsg name="startDate" />
              </div>
              <div className="md:col-span-1 relative">
                <label className={labelClass}>Deadline <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.deadline ? 'text-red-400' : 'text-gray-400'}`} />
                  <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} className={getInputClass("deadline")} />
                </div>
                <ErrorMsg name="deadline" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Scheme */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><DollarSign size={16} /></span>
              Skema Pembayaran
            </h2>
            <p className="text-sm text-gray-500 mb-6 pl-10">Tentukan persentase termin pembayaran berdasarkan progress proyek (Opsional).</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { val: "20", label: "DP 20%", desc: "Uang muka awal" },
                { val: "50", label: "Termin 50%", desc: "Progress 50%" },
                { val: "80", label: "Termin 80%", desc: "Progress 80%" },
                { val: "100", label: "Pelunasan 100%", desc: "Serah terima" },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => togglePayment(item.val)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                    paymentScheme.includes(item.val)
                      ? "border-green-500 bg-green-50/50 shadow-sm shadow-green-100"
                      : "border-gray-100 bg-white hover:border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentScheme.includes(item.val) ? "border-green-500 bg-green-500" : "border-gray-300"
                    }`}>
                      {paymentScheme.includes(item.val) && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                  <p className={`text-base font-bold transition-colors ${paymentScheme.includes(item.val) ? "text-green-800" : "text-gray-900"}`}>{item.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-800 mb-4">Jadwal Estimasi Termin</p>
              <div className="space-y-4">
                {paymentScheme.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Belum ada termin yang dipilih.</p>
                ) : (
                  paymentScheme.map((p) => (
                     <div key={p} className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 text-center shadow-sm">
                        Termin {p}%
                      </div>
                      <input
                        type="date"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="text"
                        placeholder="Catatan / Syarat Dokumen"
                        className="flex-[2] px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Scope of Work */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><Building2 size={16} /></span>
              Lingkup Pekerjaan (Scope of Work)
            </h2>
            <p className="text-sm text-gray-500 mb-6 pl-10">Pilih bidang pekerjaan utama yang termasuk dalam kontrak ini (Opsional).</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {["Pekerjaan Struktur", "Pekerjaan Arsitektur", "Pekerjaan MEP", "Finishing", "Landscape & Taman", "Interior & Furniture"].map((scope) => (
                <button
                  key={scope}
                  onClick={() => toggleScope(scope)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-md ${
                    scopes.includes(scope) ? "border-orange-500 bg-orange-50/50" : "border-gray-100 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      scopes.includes(scope) ? "border-orange-500 bg-orange-500" : "border-gray-300"
                    }`}>
                      {scopes.includes(scope) && <Check size={12} className="text-white" />}
                    </div>
                    <p className={`text-sm font-semibold leading-tight ${scopes.includes(scope) ? "text-orange-800" : "text-gray-700"}`}>{scope}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div>
              <label className={labelClass}>Detail Lingkup Pekerjaan</label>
              <textarea
                className={`${getInputClass("scopeDesc")} resize-none !pl-4`}
                rows={5}
                placeholder="Jabarkan lebih spesifik mengenai batas pekerjaan yang dilakukan..."
              />
            </div>
          </div>
        )}

        {/* Step 5: Upload Documents */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Upload size={16} /></span>
              Unggah Dokumen Pendukung
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              {[
                { key: "blueprint", label: "Blueprint / Gambar Kerja", accept: ".pdf,.dwg,.jpg,.png", required: true },
                { key: "contract", label: "Dokumen Kontrak (SPK)", accept: ".pdf,.doc,.docx", required: true },
                { key: "photos", label: "Foto Site / Lokasi Awal", accept: ".jpg,.jpeg,.png", required: false },
                { key: "supporting", label: "Izin & Legalitas Lain", accept: ".pdf,.doc,.docx", required: false },
              ].map((doc) => (
                <div key={doc.key} className="relative">
                  <div className={`relative overflow-hidden group border-2 border-dashed ${errors[doc.key] ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-2xl p-6 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer`}>
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${uploadedFiles[doc.key] ? "bg-green-100 text-green-600" : errors[doc.key] ? "bg-red-100 text-red-500" : "bg-blue-50 text-blue-500 group-hover:scale-110 duration-300"}`}>
                        {uploadedFiles[doc.key] ? <Check size={20} /> : <Upload size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {doc.label} {doc.required && <span className="text-red-500">*</span>}
                        </p>
                        <p className="text-xs mt-1">
                          {uploadedFiles[doc.key] ? (
                            <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Terpilih: {uploadedFiles[doc.key]}</span>
                          ) : (
                            <span className={errors[doc.key] ? "text-red-500" : "text-gray-400"}>Pilih file ({doc.accept})</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <input type="file" accept={doc.accept} onChange={(e) => handleFileUpload(doc.key, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Upload file" />
                  </div>
                  {errors[doc.key] && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors[doc.key]}</p>}
                </div>
              ))}
            </div>

            {/* Premium Generate RAB CTA */}
            <div className="mt-8 p-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/20">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-yellow-400 rounded-lg shadow-inner"><Zap size={16} className="text-yellow-900" /></div>
                    <h3 className="text-lg font-bold text-white">AI Smart RAB Generator</h3>
                  </div>
                  <p className="text-white/80 text-sm max-w-md">
                    Biarkan sistem AI menghasilkan Rencana Anggaran Biaya (RAB) terperinci secara otomatis berdasarkan parameter teknis yang Anda masukkan di atas.
                  </p>
                </div>
                <button
                  onClick={handleGenerateRAB}
                  disabled={isGeneratingRAB}
                  className="px-6 py-3 bg-white text-purple-700 font-bold rounded-xl text-sm whitespace-nowrap flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md disabled:opacity-90 disabled:pointer-events-none"
                >
                  {isGeneratingRAB ? (
                    <><Loader2 size={18} className="animate-spin text-purple-600" /> {aiLoadingText}</>
                  ) : (
                    <><Zap size={18} className="text-yellow-500" /> Simpan & Generate RAB</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons Container */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              step === 1 ? "opacity-0 pointer-events-none" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ← Kembali
          </button>
          
          {step < 5 ? (
            <button
              onClick={() => {
                if (validateStep(step)) setStep(Math.min(5, step + 1));
              }}
              className="group flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300"
            >
              Lanjutkan <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (validateStep(step)) handleSaveProject();
              }}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                 <>Menyimpan...</>
              ) : (
                 <><Check size={18} /> {id ? "Simpan Perubahan" : "Simpan Proyek Sekarang"}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
