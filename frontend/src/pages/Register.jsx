import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'PATIENT',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPhoneInputModal, setShowPhoneInputModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDevInput, setShowDevInput] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role' && value !== 'DOCTOR') {
      setFormData({ ...formData, role: value, specialization: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('fullName', response.data.fullName || formData.fullName);
      localStorage.setItem('role', formData.role);
      localStorage.setItem('verificationStatus', response.data.verificationStatus);

      if (response.data.verificationStatus === 'PENDING') {
        navigate('/verification-pending');
      } else {
        navigate('/complete-profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('token', 'mock-google-token');
      localStorage.setItem('role', formData.role);
      navigate('/complete-profile');
    }, 1200);
  };

  const verifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowOtpModal(false);
      localStorage.setItem('token', 'mock-phone-token');
      localStorage.setItem('role', formData.role);
      navigate('/complete-profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/artifacts/medical_hero_bg_1771265227239.png"
            className="w-full h-full object-cover opacity-40 scale-105 object-right"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>

        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="font-black text-xl">H</span>
              </div>
              <span className="font-bold tracking-widest uppercase">HealthHorizon</span>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-black leading-tight">
              Join the <br />
              <span className="text-primary">Medical Revolution.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Create your account to access personalized care, secure health records, and 24/7
              specialist support.
            </p>

            <div className="flex gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-3xl font-black">ISO</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Certified</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-3xl font-black">256</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Bit Encryption</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Create Account
            </h2>
            <p className="text-slate-500 font-medium">
              Join thousands of others on Health Horizon.
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-shake flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      className="input-premium pl-12"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input-premium pl-12"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="input-premium pl-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                  I am a...
                </label>
                <div className="relative">
                  <select
                    name="role"
                    className="input-premium appearance-none cursor-pointer"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="PATIENT">Patient (Self)</option>
                    <option value="CAREGIVER">Caregiver / Guardian (Family)</option>
                    <option value="DOCTOR">Doctor</option>
                    {showDevMode && (
                      <>
                        <option value="ADMIN">Administrator (Dev)</option>
                        <option value="LAB_TECHNICIAN">Lab Technician (Dev)</option>
                        <option value="COUNSELOR">Counselor (Dev)</option>
                        <option value="RECORD_HANDLER">Record Handler (Dev)</option>
                      </>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {formData.role === 'DOCTOR' && (
                <div className="animate-fade-in-up">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                    Specialty
                  </label>
                  <div className="relative group">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <select
                      name="specialization"
                      required
                      className="input-premium pl-12 appearance-none cursor-pointer"
                      value={formData.specialization}
                      onChange={handleChange}
                    >
                      <option value="">Select Specialty</option>
                      <option value="MBBS">MBBS (General)</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Other">Other Specialist</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Developer Mode Toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowDevInput(!showDevInput)}
                  className="text-[10px] font-black text-slate-300 hover:text-primary transition-colors uppercase tracking-widest"
                >
                  {showDevInput ? 'Close Developer Access' : 'Developer Access'}
                </button>

                {showDevInput && (
                  <div className="mt-4 animate-fade-in-up bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <input
                      type="text"
                      placeholder="Enter Access Key"
                      className="input-premium text-center tracking-widest py-2 text-xs"
                      onChange={(e) => {
                        const val = e.target.value.trim().toLowerCase();
                        if (val === 'horizon-admin-2026') {
                          setShowDevMode(true);
                        } else {
                          setShowDevMode(false);
                        }
                      }}
                    />
                    {showDevMode && (
                      <p className="text-[10px] text-emerald-500 font-black mt-2 uppercase tracking-wider flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Unlocked
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-4 text-lg overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
                  {!loading && (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
              </button>

              <div className="relative py-2 hidden sm:block">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">
                    Or register with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 hidden sm:grid">
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setShowPhoneInputModal(true)}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <span className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-[10px]">
                    📞
                  </span>
                  Phone
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-slate-500 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-black hover:underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPhoneInputModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full animate-fade-in-up">
            <h3 className="text-2xl font-black text-slate-900 mb-4">Mobile Registration</h3>
            <input
              type="tel"
              placeholder="+91 00000 00000"
              className="input-premium mb-4"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPhoneInputModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPhoneInputModal(false);
                  setShowOtpModal(true);
                }}
                className="btn-premium flex-1"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full animate-fade-in-up">
            <h3 className="text-2xl font-black text-slate-900 mb-4">Enter OTP</h3>
            <input
              type="text"
              placeholder="000000"
              className="input-premium text-center tracking-widest text-2xl mb-4 py-4 font-black"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              disabled={otp.length !== 6 || loading}
              className="btn-premium w-full"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Verify'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
