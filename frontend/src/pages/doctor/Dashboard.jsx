import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FilePlus,
  LogOut,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  BarChart2,
  Stethoscope,
  FlaskConical,
  Brain,
  MessageCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import NotificationBell from '../../components/NotificationBell';
import { useToast } from '../../hooks/useToast';
import NavProfile from '../../components/NavProfile';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/doctors/me');
        setProfile(profileRes.data);
        const prescriptionsRes = await api.get('/prescriptions/my-prescriptions');
        setPrescriptions(prescriptionsRes.data);

        const analyticsRes = await api.get('/analytics/doctor');
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
        // If 403/401, redirect to login
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleUpdate = () => {
      const fetchProfile = async () => {
        try {
          const res = await api.get('/doctors/me');
          setProfile(res.data);
        } catch (err) {
          console.error('Failed to sync profile', err);
        }
      };
      fetchProfile();
    };

    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col hidden md:flex relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Stethoscope className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                Health
              </h1>
              <span className="text-primary font-bold text-sm uppercase tracking-widest">
                Horizon
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard', active: true },
            { icon: MessageCircle, label: 'Messages', path: '/doctor/messaging' },
            { icon: User, label: 'My Profile', path: '/doctor/profile' },
            { icon: FilePlus, label: 'Issue Prescription', path: '/doctor/issue-prescription' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group ${item.active ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${item.active ? 'text-primary' : ''}`}
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 relative overflow-hidden group mb-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
              Internal
            </p>
            <p className="text-sm font-bold text-white relative z-10">Clinical Protocol v2.5</p>
            <button className="mt-4 text-xs font-black text-slate-900 bg-white px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all relative z-10">
              Review
            </button>
          </div>

          <NavProfile />

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-5 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all group mt-2"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Background Asset */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none z-0 overflow-hidden">
          <img
            src="/src/artifacts/doctor_clinical_bg_1771267138681.png"
            className="w-full h-full object-cover grayscale"
            alt=""
          />
        </div>

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2 block animate-pulse">
                Clinical Environment Active
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Welcome, Dr.{' '}
                {profile?.fullName
                  ? profile.fullName.split(' ')[profile.fullName.split(' ').length - 1]
                  : 'Doctor'}
              </h2>
              {profile?.specialization && (
                <p className="text-primary font-bold mt-1 text-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  {profile.specialization} Specialist
                </p>
              )}
              <p className="text-slate-500 font-medium mt-1">
                Overseeing patient care and clinical operations.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 shadow-xl transition-all duration-500 ${profile?.isVerified ? 'bg-white border-primary text-primary' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
              >
                {profile?.isVerified ? (
                  <CheckCircle className="w-6 h-6 animate-bounce" />
                ) : (
                  <XCircle className="w-6 h-6 animate-pulse" />
                )}
                <span className="font-black text-sm uppercase tracking-widest">
                  {profile?.isVerified ? 'Verified Practice' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              to="/doctor/issue-prescription"
              className="relative overflow-hidden group p-10 rounded-[3rem] bg-slate-900 text-white flex flex-col justify-between h-52 transition-all hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="p-4 bg-white/10 rounded-[2rem] border border-white/20 backdrop-blur-md group-hover:rotate-6 transition-transform">
                  <FilePlus className="w-8 h-8 text-primary" />
                </div>
                <span className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1 rounded-full">
                  Primary Action
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight">
                  {prescriptions.length > 0 ? 'Update Files' : 'Issue Prescription'}
                </h3>
                <p className="text-slate-400 font-bold mt-1 text-lg">
                  Electronic Health Record Management
                </p>
              </div>
            </Link>

            <div className="glass-card p-10 rounded-[3rem] flex flex-col justify-center h-52 group hover-lift">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-indigo-500/10 rounded-[2rem] group-hover:scale-110 transition-transform">
                  <BarChart2 className="w-10 h-10 text-indigo-500" />
                </div>
                <div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-1">
                    Practice Growth
                  </p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">
                    +12.4<span className="text-2xl text-slate-400">%</span>
                  </p>
                  <p className="text-sm text-emerald-500 font-bold mt-1 inline-flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Higher than avg.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Referral Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="glass-card p-10 rounded-[3rem] border-blue-100/50 hover-lift group">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <FlaskConical className="w-6 h-6 text-primary" />
                Laboratory Referral
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Patient Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. HH-PAT-123"
                    id="lab-patient-id"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Test Specification
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Comprehensive Metabolic Panel"
                    id="lab-test-name"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                  />
                </div>
                <button
                  onClick={async () => {
                    const pId = document.getElementById('lab-patient-id').value;
                    const tName = document.getElementById('lab-test-name').value;
                    if (!pId || !tName)
                      return addToast('Please specify subject and test metric.', 'warning');
                    await api.post('/lab/request', {
                      patientId: pId,
                      doctorId: profile.id,
                      testName: tName,
                      clinicalReason: 'Routine clinical assessment',
                    });
                    addToast('Lab Test Order dispatched to Diagnostic Pipeline.', 'success');
                    document.getElementById('lab-patient-id').value = '';
                    document.getElementById('lab-test-name').value = '';
                  }}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all relative overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  <span className="relative z-10">Dispatch Lab Order</span>
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/doctor/messaging')}
                    className="flex-1 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Patient Messages
                  </button>
                  <button className="flex-1 py-3 bg-violet-50 text-violet-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-100 transition-colors flex items-center justify-center gap-2">
                    <Brain className="w-4 h-4" /> Counselor
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] border-violet-100/50 hover-lift group">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6 text-violet-500" />
                Counselor Referral
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Patient Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. HH-PAT-123"
                    id="counsel-patient-id"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 focus-aura outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Clinical Indication
                  </label>
                  <input
                    type="text"
                    placeholder="Reason for behavioral referral"
                    id="counsel-reason"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={async () => {
                    const pId = document.getElementById('counsel-patient-id').value;
                    const reason = document.getElementById('counsel-reason').value;
                    if (!pId || !reason)
                      return addToast('Patient ID and Indication are required.', 'warning');
                    await api.post('/counseling/refer', {
                      patientId: pId,
                      doctorId: profile.id,
                      reason: reason,
                    });
                    addToast('Behavioral Referral successfully authorized.', 'success');
                    document.getElementById('counsel-patient-id').value = '';
                    document.getElementById('counsel-reason').value = '';
                  }}
                  className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-1 transition-all"
                >
                  Authorize Referral
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="glass-card p-10 rounded-[3rem] border-slate-200/50 mb-8 animate-fade-in-up hover-lift">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-primary" />
                  Consultation Volume
                </h3>
                <p className="text-slate-400 font-bold text-sm mt-1">
                  Monthly practice throughput analytics
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Monthly
                </span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.appointmentTrends || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '24px',
                      border: 'none',
                      boxShadow: '0 20px 40px -10px rgba(15,23,42,0.1)',
                      padding: '16px',
                    }}
                    itemStyle={{ fontWeight: 800, color: '#0EA5E9' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0EA5E9"
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#0EA5E9', strokeWidth: 4, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#0EA5E9', strokeWidth: 0 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="glass-card rounded-[3rem] overflow-hidden border-slate-200/50 animate-fade-in-up animation-delay-300">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <FilePlus className="w-6 h-6 text-primary" />
                  Clinical History
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Past 30 Records
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {prescriptions.length === 0 ? (
                  <div className="p-20 text-center">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic text-lg">
                      No clinical records found in the current ledger.
                    </p>
                  </div>
                ) : (
                  prescriptions.map((script) => (
                    <div
                      key={script.id}
                      className="p-10 hover:bg-slate-50/80 transition-all group/row"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover/row:border-primary group-hover/row:scale-110 transition-all overflow-hidden">
                            {script.patientProfilePictureUrl ? (
                              <img
                                src={`http://localhost:8080${script.patientProfilePictureUrl}`}
                                alt={script.patientName || 'Patient'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '';
                                }}
                              />
                            ) : (
                              <span className="text-primary font-black text-sm">
                                {script.patientName
                                  ? script.patientName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .substring(0, 2)
                                  : 'P'}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">
                              Patient: {script.patientName || 'Unknown Patient'}
                            </h4>
                            <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">
                              Registry ID: {script.patientId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden lg:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                              Authorization Date
                            </p>
                            <p className="font-bold text-slate-900">{script.prescriptionDate}</p>
                          </div>
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group-hover/row:bg-white transition-colors">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                            Primary Diagnosis
                          </span>
                          <p className="text-slate-700 font-bold tracking-tight leading-relaxed">
                            {script.diagnosis}
                          </p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group-hover/row:bg-white transition-colors">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                            Medication Details
                          </span>
                          <p className="text-slate-700 font-bold tracking-tight leading-relaxed">
                            {script.medications}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
