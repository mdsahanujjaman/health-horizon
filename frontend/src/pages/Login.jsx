import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { playLoginWelcomeSound } from '../utils/audio';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPhoneInputModal, setShowPhoneInputModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/authenticate', formData);
      const { token, userId, fullName, role, verificationStatus, profilePictureUrl } =
        response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('role', role);
      localStorage.setItem('verificationStatus', verificationStatus);
      if (profilePictureUrl) localStorage.setItem('profilePictureUrl', profilePictureUrl);

      playLoginWelcomeSound();

      if (verificationStatus === 'PENDING') {
        navigate('/verification-pending');
        return;
      }

      if (verificationStatus === 'REJECTED') {
        setError('Account application rejected. Please contact support.');
        localStorage.clear();
        return;
      }

      // Redirect based on role
      switch (role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard');
          break;
        case 'LAB_TECHNICIAN':
          navigate('/lab/dashboard');
          break;
        case 'COUNSELOR':
          navigate('/counselor/dashboard');
          break;
        case 'RECORD_HANDLER':
          navigate('/handler/dashboard');
          break;
        case 'PATIENT':
        case 'CAREGIVER':
        default:
          navigate('/patient/dashboard');
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('token', 'mock-google-token');
      playLoginWelcomeSound();
      navigate('/complete-profile');
    }, 1200);
  };

  const verifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowOtpModal(false);
      localStorage.setItem('token', 'mock-phone-token');
      playLoginWelcomeSound();
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
            className="w-full h-full object-cover opacity-40 scale-105"
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
              The Future of <br />
              <span className="text-primary">Clinical Care.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Experience a new era of healthcare management. AI-driven insights, seamless
              patient-doctor connection, and real-time health monitoring.
            </p>

            <div className="flex gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-3xl font-black">2M+</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Patients</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-3xl font-black">98%</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-shake flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              )}

              <div className="space-y-5">
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
                      autoComplete="current-password"
                      className="input-premium pl-12"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm font-bold text-primary hover:text-sky-600 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-4 text-lg overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
                  {!loading && (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
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
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary font-black hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modals - Kept simplified for brevity but functional */}
      {showPhoneInputModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full animate-fade-in-up">
            <h3 className="text-2xl font-black text-slate-900 mb-4">Login with Phone</h3>
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
            <button
              onClick={() => setShowOtpModal(false)}
              className="btn-outline w-full mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
