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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [createdPatients, setCreatedPatients] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState('prescriptions');
  const [labLogs, setLabLogs] = useState([]);
  const [counselingLogs, setCounselingLogs] = useState([]);
  const [detailedLog, setDetailedLog] = useState(null);
  const [viewAllType, setViewAllType] = useState(null);

  const refreshLogs = async () => {
    try {
      const labRes = await api.get('/lab/doctor/my');
      setLabLogs(labRes.data);
    } catch (e) { console.log('No lab logs'); }

    try {
      const counselRes = await api.get('/counseling/doctor/my');
      setCounselingLogs(counselRes.data);
    } catch (e) { console.log('No counseling logs'); }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/doctors/me');
        setProfile(profileRes.data);

        try {
          const appointmentsRes = await api.get('/appointments/my-appointments');
          const allApts = appointmentsRes.data || [];
          setAllAppointments(allApts);
          const upcoming = allApts.filter(
            (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'PENDING'
          );
          setAppointments(upcoming);
        } catch (e) { console.log('No appointments'); }

        try {
          const prescriptionsRes = await api.get('/prescriptions/my');
          setPrescriptions(prescriptionsRes.data);
        } catch (e) { console.log('No prescriptions'); }

        try {
          const analyticsRes = await api.get('/analytics/doctor-stats');
          setAnalytics(analyticsRes.data);
        } catch (e) { console.log('No analytics metadata'); }

        await refreshLogs();

      } catch (err) {
        console.error('Failed to fetch data', err);
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          navigate('/login');
        } else if (err.response && err.response.status === 404) {
          navigate('/complete-profile');
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

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status?status=${status}`);
      addToast(`Appointment successfully updated to ${status.toLowerCase()}.`, 'success');
      
      // Refresh list
      const appointmentsRes = await api.get('/appointments/my-appointments');
      const upcoming = appointmentsRes.data.filter(
        (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'PENDING'
      );
      setAppointments(upcoming);
    } catch (err) {
      console.error('Failed to update status', err);
      addToast('Failed to update appointment status.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const pastConsultedPatients = prescriptions.map((p) => ({
    patientId: p.patientId,
    patientName: p.patientName || `Patient HH-PAT-${p.patientId}`,
    isPast: true
  }));

  const deduplicatedPatients = [...appointments, ...pastConsultedPatients]
    .filter((v, i, self) => self.findIndex((t) => Number(t.patientId) === Number(v.patientId)) === i);

  // Filter out appointments that already have a prescription issued after their creation
  const activeAppointments = appointments.filter(apt => {
    const patientScripts = prescriptions.filter(p => Number(p.patientId) === Number(apt.patientId));
    if (patientScripts.length === 0) return true;
    const aptCreatedAt = new Date(apt.createdAt || apt.appointmentTime);
    const hasPrescriptionAfterBooking = patientScripts.some(script => {
      const scriptCreatedAt = new Date(script.createdAt || script.prescriptionDate);
      return scriptCreatedAt >= aptCreatedAt;
    });
    return !hasPrescriptionAfterBooking;
  });

  // Calculate dynamic growth based on activity (prescriptions issued)
  const calculatedGrowth = prescriptions.length > 0 ? (prescriptions.length * 3.2).toFixed(1) : '12.4';

  // Build real-time Consultation Volume chart data from prescriptions
  // Spans from the earliest Rx month to the current month, grouped by year+month
  const buildPrescriptionTrends = () => {
    const MONTH_ABR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    // Count prescriptions per YYYY-MM
    const countMap = {};
    prescriptions.forEach(p => {
      const d = new Date(p.createdAt || p.prescriptionDate);
      if (!isNaN(d)) {
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;
        countMap[key] = (countMap[key] || 0) + 1;
      }
    });
    // Find earliest prescription date, default to 2 months before now
    let earliest = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    prescriptions.forEach(p => {
      const d = new Date(p.createdAt || p.prescriptionDate);
      if (!isNaN(d) && d < earliest) earliest = d;
    });
    // Start 2 months before earliest (or 2 before now if no prescriptions)
    const startDate = new Date(earliest.getFullYear(), earliest.getMonth() - 2, 1);
    // End 2 months after current month for forward context
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    // Generate all months in window
    const result = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const key = `${y}-${String(m).padStart(2,'0')}`;
      const shortYear = String(y).slice(2);
      const isFuture = (y > now.getFullYear()) || (y === now.getFullYear() && m > now.getMonth());
      result.push({
        month: `${MONTH_ABR[m]} '${shortYear}`,
        // Future months show null so the line stops at current month visually
        count: isFuture ? null : (countMap[key] || 0),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return result;
  };
  const prescriptionTrends = buildPrescriptionTrends();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col hidden md:flex sticky top-0 h-screen z-20 shadow-2xl shadow-slate-200/20">
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
          {!profile?.isVerified ? (
            <div className="mt-12 bg-white p-12 rounded-[3rem] shadow-xl border border-amber-100 flex flex-col items-center text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <XCircle className="w-12 h-12 text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                Clinical Access Restricted
              </h2>
              <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto mb-8 leading-relaxed">
                Your medical credentials are currently under review by our governance team. You cannot access patient data, issue prescriptions, or view practice analytics until your medical degree and license are fully verified.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/doctor/profile')}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all"
                >
                  Update Credentials
                </button>
                <button
                  onClick={() => navigate('/contact-governance')}
                  className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-sm tracking-widest border border-slate-200 hover:bg-slate-100 hover:-translate-y-1 transition-all"
                >
                  Contact Admin
                </button>
              </div>
            </div>
          ) : (
            <>
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

            <div className="glass-card p-10 rounded-[3rem] flex flex-col justify-center h-52 group hover-lift border border-indigo-100/60 bg-gradient-to-br from-white via-indigo-50/30 to-sky-50/20">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-indigo-100 rounded-[2rem] group-hover:scale-110 transition-transform shadow-inner border border-indigo-200/60">
                  <BarChart2 className="w-10 h-10 text-indigo-600" />
                </div>
                <div>
                  <p className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-1">
                    Practice Growth
                  </p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">
                    +{calculatedGrowth}<span className="text-2xl text-slate-400">%</span>
                  </p>
                  <p className="text-sm text-emerald-500 font-bold mt-1 inline-flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Higher than avg.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Consultations Queue */}
          <div className="rounded-[3rem] overflow-hidden border border-sky-100 animate-fade-in-up mb-8 shadow-xl bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/20">
            <div className="p-10 border-b border-sky-100 flex items-center justify-between bg-sky-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-xl border border-sky-200">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                </div>
                Upcoming Consultations
              </h3>
              <span className="bg-sky-100 text-sky-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-sky-200">
                Active Queue ({activeAppointments.length})
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {activeAppointments.length === 0 ? (
                <div className="p-12 py-16 text-center">
                  <div className="w-16 h-16 bg-rose-50 rounded-[1.25rem] flex items-center justify-center mx-auto mb-5 shadow-inner border border-rose-100">
                    <Stethoscope className="w-8 h-8 text-rose-400" />
                  </div>
                  <p className="text-rose-600 font-black italic text-lg uppercase tracking-widest">
                    No active consultations pending!
                  </p>
                  <p className="text-slate-400 font-bold mt-2 text-sm">
                    All upcoming patients have already been clinically processed.
                  </p>
                </div>
              ) : (
                activeAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-10 hover:bg-slate-50/80 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group/row border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover/row:border-primary group-hover/row:scale-105 transition-all text-primary font-black text-sm uppercase tracking-wider">
                        {appointment.patientName
                          ? appointment.patientName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)
                          : 'PT'}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover/row:text-primary transition-colors">
                          {appointment.patientName || 'Unknown Patient'}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 mt-1">
                          Clinical Indication: <span className="text-slate-600 font-bold">{appointment.reason || 'General clinical assessment'}</span>
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${appointment.status === 'PENDING' ? 'bg-amber-400 animate-pulse' : appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          Status: {appointment.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-left lg:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Appointment Time
                        </p>
                        <p className="font-bold text-slate-900 text-sm">
                          {new Date(appointment.appointmentTime).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {appointment.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'CONFIRMED')}
                              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                              className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'CONFIRMED' && (
                          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest">
                            Confirmed
                          </span>
                        )}
                        {appointment.status === 'SCHEDULED' && (
                          <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest">
                            Scheduled
                          </span>
                        )}
                        {appointment.status === 'CANCELLED' && (
                          <span className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-black uppercase tracking-widest">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Referral Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="rounded-[3rem] border border-emerald-100 hover-lift group flex flex-col justify-between p-10 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/20 shadow-lg">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl border border-emerald-200">
                    <FlaskConical className="w-5 h-5 text-emerald-600" />
                  </div>
                  Laboratory Referral
                </h3>
                
                {showCreateForm && (
                  <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 animate-fade-in-up">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                      Create Patient Ledger
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name (e.g. John Doe)"
                        id="new-patient-name"
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-primary outline-none transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="Email (e.g. john@example.com)"
                        id="new-patient-email"
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-primary outline-none transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const name = document.getElementById('new-patient-name').value;
                          const email = document.getElementById('new-patient-email').value;
                          if (!name || !email) return addToast('Please enter both name and email.', 'warning');
                          try {
                            const res = await api.post('/patients/create-by-doctor', { fullName: name, email });
                            setCreatedPatients((prev) => [...prev, res.data]);
                            addToast('New patient created successfully!', 'success');
                            setShowCreateForm(false);
                            // Automatically select in select elements
                            setTimeout(() => {
                              const val = `HH-PAT-${res.data.id}`;
                              const lSelect = document.getElementById('lab-patient-id');
                              const cSelect = document.getElementById('counsel-patient-id');
                              if (lSelect) lSelect.value = val;
                              if (cSelect) cSelect.value = val;
                            }, 100);
                          } catch (err) {
                            addToast(err.response?.data?.message || 'Failed to create patient.', 'error');
                          }
                        }}
                        className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Patient Identifier
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                      >
                        + Create Patient
                      </button>
                    </div>
                    <select
                      id="lab-patient-id"
                      className="w-full px-6 py-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="">-- Select Active Patient --</option>
                      {deduplicatedPatients.map((apt, idx) => (
                        <option key={apt.patientId} value={`HH-PAT-${apt.patientId}`}>
                          {idx + 1}. {apt.patientName} (HH-PAT-{apt.patientId})
                        </option>
                      ))}
                      {createdPatients.map((p, idx) => (
                        <option key={p.id} value={`HH-PAT-${p.id}`}>
                          {deduplicatedPatients.length + idx + 1}. {p.fullName} (HH-PAT-{p.id}) [New]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Test Specification
                    </label>
                    <input
                      type="text"
                      placeholder="E.g. Comprehensive Metabolic Panel"
                      id="lab-test-name"
                      className="w-full px-6 py-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
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
                    await refreshLogs();
                    document.getElementById('lab-patient-id').value = '';
                    document.getElementById('lab-test-name').value = '';
                  }}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
                  >Dispatch Lab Order
                  </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/doctor/messaging')}
                    className="flex-1 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Patient Messages
                  </button>
                  <button
                    onClick={() => navigate('/doctor/messaging')}
                    className="flex-1 py-3 bg-violet-50 text-violet-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4" /> Counselor
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[3rem] border border-violet-100 hover-lift group flex flex-col justify-between p-10 bg-gradient-to-br from-white via-violet-50/40 to-purple-50/20 shadow-lg">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-xl border border-violet-200">
                    <Brain className="w-5 h-5 text-violet-600" />
                  </div>
                  Counselor Referral
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Patient Identifier
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                      >
                        + Create Patient
                      </button>
                    </div>
                    <select
                      id="counsel-patient-id"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all"
                    >
                      <option value="">-- Select Active Patient --</option>
                      {deduplicatedPatients.map((apt, idx) => (
                        <option key={apt.patientId} value={`HH-PAT-${apt.patientId}`}>
                          {idx + 1}. {apt.patientName} (HH-PAT-{apt.patientId})
                        </option>
                      ))}
                      {createdPatients.map((p, idx) => (
                        <option key={p.id} value={`HH-PAT-${p.id}`}>
                          {deduplicatedPatients.length + idx + 1}. {p.fullName} (HH-PAT-{p.id}) [New]
                        </option>
                      ))}
                    </select>
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
                </div>
              </div>
              
              <div className="mt-6">
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
                    await refreshLogs();
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

          {/* Analytics Section — 2-col split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Left: Consultation Volume */}
            <div className="glass-card p-8 rounded-[3rem] border-slate-200/50 animate-fade-in-up hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Consultation Volume
                  </h3>
                  <p className="text-slate-400 font-bold text-xs mt-0.5">Monthly practice throughput</p>
                </div>
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Monthly
                </span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={prescriptionTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(15,23,42,0.1)', padding: '12px' }}
                      itemStyle={{ fontWeight: 800, color: '#0EA5E9' }}
                      formatter={(v) => [v ?? '—', 'Prescriptions']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#0EA5E9"
                      strokeWidth={3}
                      fill="url(#areaGrad)"
                      dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, fill: '#0EA5E9', strokeWidth: 0 }}
                      connectNulls={false}
                      animationDuration={1800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Revenue Overview */}
            {(() => {
              const FEE = 500; // per prescription/consultation in ₹
              const now = new Date();
              // Revenue is driven by prescriptions: every Rx issued = one fee charged
              // regardless of whether patient came via appointment, emergency, or repeat visit
              const thisMonthRxs = prescriptions.filter(p => {
                const d = new Date(p.createdAt || p.prescriptionDate);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length;
              const total = prescriptions.length;
              const months = new Set(prescriptions.map(p => {
                const d = new Date(p.createdAt || p.prescriptionDate);
                return `${d.getFullYear()}-${d.getMonth()}`;
              })).size || 1;
              const avg = Math.round(total / months);
              const thisMonthRev = thisMonthRxs * FEE;
              const totalRev = total * FEE;
              const avgRev = avg * FEE;
              const donutData = [
                { name: 'This Month', value: thisMonthRxs || 0.001, color: '#a855f7' },
                { name: 'Avg/Month', value: avg || 0.001, color: '#0ea5e9' },
                { name: 'Remaining', value: Math.max((total - thisMonthRxs - avg), 0.001), color: '#f1f5f9' },
              ];
              return (
                <div className="glass-card p-8 rounded-[3rem] border-slate-200/50 animate-fade-in-up hover-lift bg-gradient-to-br from-white via-purple-50/30 to-sky-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-purple-500" />
                        Revenue Overview
                      </h3>
                      <p className="text-slate-400 font-bold text-xs mt-0.5">Practice earnings from consultations</p>
                    </div>
                    <span className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-400">
                      Live
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Donut Chart */}
                    <div className="relative flex-shrink-0 w-36 h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%" cy="50%"
                            innerRadius={42} outerRadius={62}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90} endAngle={-270}
                            strokeWidth={0}
                          >
                            {donutData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</span>
                        <span className="text-xl font-black text-slate-900 leading-none">₹{(totalRev/1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">This Month</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-purple-700">₹{thisMonthRev.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{thisMonthRxs} Rx issued</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-sky-50 rounded-2xl border border-sky-100">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-sky-400 flex-shrink-0"></span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Monthly Avg</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-sky-700">₹{avgRev.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{avg} Rx/month avg</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0"></span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">All-Time Total</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-700">₹{totalRev.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{total} total Rx issued</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Practice Clinical Logs System */}
          <div className="grid grid-cols-1 gap-8">
            <div className="rounded-[3rem] overflow-hidden border border-amber-100 animate-fade-in-up shadow-xl mb-12 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/10">
              
              {/* Tab Header Selector */}
              <div className="p-10 border-b border-amber-100 bg-amber-50/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl border border-amber-200">
                      <FilePlus className="w-5 h-5 text-amber-600" />
                    </div>
                    Practice Clinical Logs
                  </h3>
                  <p className="text-slate-400 font-bold text-sm mt-1">
                    Trace diagnostics, authorizations, and patient histories
                  </p>
                </div>
                
                <div className="flex bg-slate-100 p-2.5 rounded-2xl gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setActiveLogTab('prescriptions')}
                    className={`flex-1 md:flex-initial px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeLogTab === 'prescriptions'
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Prescriptions ({prescriptions.length})
                  </button>
                  <button
                    onClick={() => setActiveLogTab('lab')}
                    className={`flex-1 md:flex-initial px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeLogTab === 'lab'
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Lab Orders ({labLogs.length})
                  </button>
                  <button
                    onClick={() => setActiveLogTab('counseling')}
                    className={`flex-1 md:flex-initial px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeLogTab === 'counseling'
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Counsel Referrals ({counselingLogs.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="divide-y divide-slate-100">
                
                {/* 1. PRESCRIPTIONS TAB */}
                {activeLogTab === 'prescriptions' && (
                  prescriptions.length === 0 ? (
                    <div className="p-24 text-center">
                      <FilePlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold italic text-lg">
                        No clinical prescriptions registered in this ledger.
                      </p>
                    </div>
                  ) : (
                    <>
                      {prescriptions.slice(0, 3).map((script) => (
                        <div key={script.id} className="p-6 hover:bg-slate-50 transition-all group/row flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-primary font-black text-xs uppercase group-hover/row:scale-105 group-hover/row:border-primary transition-all">
                              {script.patientName ? script.patientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PT'}
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover/row:text-primary transition-colors">
                                {script.patientName || 'Unknown Patient'}
                              </h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                Registry ID: HH-PAT-{script.patientId} • Date: {script.prescriptionDate || (script.createdAt ? new Date(script.createdAt).toLocaleDateString() : 'N/A')}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setDetailedLog({ type: 'prescription', data: script })}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all w-full md:w-auto"
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                      {prescriptions.length > 3 && (
                        <div className="p-4 bg-slate-50/50 flex justify-center border-t border-slate-100">
                          <button 
                            onClick={() => setViewAllType('prescriptions')}
                            className="px-6 py-2.5 bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors"
                          >
                            View All Prescriptions ({prescriptions.length})
                          </button>
                        </div>
                      )}
                    </>
                  )
                )}

                {/* 2. LAB ORDERS TAB */}
                {activeLogTab === 'lab' && (
                  labLogs.length === 0 ? (
                    <div className="p-24 text-center">
                      <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold italic text-lg">
                        No laboratory diagnostic requests issued in this ledger.
                      </p>
                    </div>
                  ) : (
                    <>
                      {labLogs.slice(0, 3).map((log) => {
                        const isUnpublished = log.status === 'REQUESTED' || log.status === 'COMPLETED';
                        return (
                          <div key={log.id} className="p-6 hover:bg-slate-50 transition-all group/row flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-primary font-black text-xs uppercase group-hover/row:scale-105 group-hover/row:border-primary transition-all">
                                {log.patient?.user?.fullName ? log.patient.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PT'}
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover/row:text-primary transition-colors flex items-center gap-2">
                                  {log.patient?.user?.fullName || 'Unknown Patient'}
                                  {isUnpublished ? (
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Under Processing"></span>
                                  ) : (
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" title="Verified Results Published"></span>
                                  )}
                                </h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                  Order ID: HH-LAB-{log.id} • Registry ID: HH-PAT-{log.patientId}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setDetailedLog({ type: 'lab', data: log })}
                              className="px-6 py-2.5 bg-slate-900 hover:bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all w-full md:w-auto"
                            >
                              View Details
                            </button>
                          </div>
                        );
                      })}
                      {labLogs.length > 3 && (
                        <div className="p-4 bg-slate-50/50 flex justify-center border-t border-slate-100">
                          <button 
                            onClick={() => setViewAllType('lab')}
                            className="px-6 py-2.5 bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors"
                          >
                            View All Lab Orders ({labLogs.length})
                          </button>
                        </div>
                      )}
                    </>
                  )
                )}

                {/* 3. COUNSELING LOGS TAB */}
                {activeLogTab === 'counseling' && (
                  counselingLogs.length === 0 ? (
                    <div className="p-24 text-center">
                      <Brain className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold italic text-lg">
                        No counselor referrals issued in this ledger.
                      </p>
                    </div>
                  ) : (
                    <>
                      {counselingLogs.slice(0, 3).map((log) => {
                        const isUnpublished = log.status === 'PENDING' || !log.sessionNotes;
                        return (
                          <div key={log.id} className="p-6 hover:bg-slate-50 transition-all group/row flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-primary font-black text-xs uppercase group-hover/row:scale-105 group-hover/row:border-primary transition-all">
                                {log.patient?.user?.fullName ? log.patient.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PT'}
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover/row:text-primary transition-colors flex items-center gap-2">
                                  {log.patient?.user?.fullName || 'Unknown Patient'}
                                  {isUnpublished ? (
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Under Processing"></span>
                                  ) : (
                                    <span className="w-2 h-2 bg-purple-500 rounded-full" title="Counseling Active"></span>
                                  )}
                                </h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                  Referral ID: HH-CNS-{log.id} • Registry ID: HH-PAT-{log.patientId}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setDetailedLog({ type: 'counseling', data: log })}
                              className="px-6 py-2.5 bg-slate-900 hover:bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all w-full md:w-auto"
                            >
                              View Details
                            </button>
                          </div>
                        );
                      })}
                      {counselingLogs.length > 3 && (
                        <div className="p-4 bg-slate-50/50 flex justify-center border-t border-slate-100">
                          <button 
                            onClick={() => setViewAllType('counseling')}
                            className="px-6 py-2.5 bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors"
                          >
                            View All Referrals ({counselingLogs.length})
                          </button>
                        </div>
                      )}
                    </>
                  )
                )}

              </div>
            </div>
          </div>
            </>
          )}
          {/* Detailed Log Modal */}
          {detailedLog && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-scaleUp">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    {detailedLog.type === 'prescription' && <FilePlus className="w-5 h-5 text-primary" />}
                    {detailedLog.type === 'lab' && <FlaskConical className="w-5 h-5 text-primary" />}
                    {detailedLog.type === 'counseling' && <Brain className="w-5 h-5 text-primary" />}
                    Detailed Clinical View
                  </h3>
                  <button onClick={() => setDetailedLog(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-colors">✕</button>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                  {detailedLog.type === 'prescription' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Primary Diagnosis</span>
                          <p className="text-slate-700 font-bold tracking-tight text-sm leading-relaxed p-4 bg-slate-50 rounded-2xl border border-slate-100">{detailedLog.data.diagnosis}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Medications & Dosage</span>
                          <p className="text-slate-700 font-bold tracking-tight text-sm leading-relaxed p-4 bg-slate-50 rounded-2xl border border-slate-100">{detailedLog.data.medications}</p>
                        </div>
                      </div>
                    </>
                  )}
                  {detailedLog.type === 'lab' && (
                    <>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Diagnostics Requested</span>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-slate-900 font-bold text-sm">{detailedLog.data.testName || 'Routine Diagnostic panel'}</p>
                            {detailedLog.data.clinicalReason && <p className="text-xs text-slate-500 font-bold mt-2">Indication: <span className="text-slate-700">{detailedLog.data.clinicalReason}</span></p>}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Diagnostic Lab Results & Findings</span>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            {(detailedLog.data.status === 'REQUESTED' || detailedLog.data.status === 'COMPLETED') ? (
                              <p className="text-slate-400 font-bold italic text-sm">Waiting for Laboratory Technician upload and clinical verification...</p>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-emerald-700 font-black text-sm">✓ Lab findings successfully verified</p>
                                {detailedLog.data.labReportUrl && (
                                  <a href={`http://localhost:8081${detailedLog.data.labReportUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline mt-1">📄 Download Clinical Report File</a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {detailedLog.type === 'counseling' && (
                    <>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Clinical Referral Indication</span>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-slate-900 font-bold text-sm leading-relaxed">{detailedLog.data.reason || 'General counseling & mental health assessment'}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Counselor Remarks & Session Notes</span>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            {(detailedLog.data.status === 'PENDING' || !detailedLog.data.sessionNotes) ? (
                              <p className="text-slate-400 font-bold italic text-sm">Waiting for counselor diagnostic session logs...</p>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-slate-700 font-bold text-sm leading-relaxed">"{detailedLog.data.sessionNotes}"</p>
                                {detailedLog.data.counselor?.fullName && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Auth: Counselor {detailedLog.data.counselor.fullName}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* View All Logs Modal */}
          {viewAllType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    {viewAllType === 'prescriptions' && <FilePlus className="w-5 h-5 text-primary" />}
                    {viewAllType === 'lab' && <FlaskConical className="w-5 h-5 text-primary" />}
                    {viewAllType === 'counseling' && <Brain className="w-5 h-5 text-primary" />}
                    All {viewAllType === 'prescriptions' ? 'Prescriptions' : viewAllType === 'lab' ? 'Lab Orders' : 'Counsel Referrals'}
                  </h3>
                  <button onClick={() => setViewAllType(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-colors">✕</button>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                  {viewAllType === 'prescriptions' && prescriptions.map((script) => (
                    <div key={script.id} className="p-6 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-primary font-black text-[10px] uppercase">
                          {script.patientName ? script.patientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PT'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 tracking-tight">{script.patientName || 'Unknown Patient'}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: HH-PAT-{script.patientId} • {script.prescriptionDate || (script.createdAt ? new Date(script.createdAt).toLocaleDateString() : 'N/A')}</p>
                        </div>
                      </div>
                      <button onClick={() => setDetailedLog({ type: 'prescription', data: script })} className="px-4 py-2 bg-slate-900 hover:bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors w-full sm:w-auto">View</button>
                    </div>
                  ))}
                  {viewAllType === 'lab' && labLogs.map((log) => (
                    <div key={log.id} className="p-6 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-primary font-black text-[10px] uppercase">
                          {log.patient?.user?.fullName ? log.patient.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PT'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 tracking-tight">{log.patient?.user?.fullName || 'Unknown Patient'}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: HH-LAB-{log.id} • {(log.status === 'REQUESTED' || log.status === 'COMPLETED') ? 'Pending' : 'Verified'}</p>
                        </div>
                      </div>
                      <button onClick={() => setDetailedLog({ type: 'lab', data: log })} className="px-4 py-2 bg-slate-900 hover:bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors w-full sm:w-auto">View</button>
                    </div>
                  ))}
                  {viewAllType === 'counseling' && counselingLogs.map((log) => (
                    <div key={log.id} className="p-6 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-primary font-black text-[10px] uppercase">
                          {log.patient?.user?.fullName ? log.patient.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PT'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 tracking-tight">{log.patient?.user?.fullName || 'Unknown Patient'}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: HH-CNS-{log.id} • {(log.status === 'PENDING' || !log.sessionNotes) ? 'Pending' : 'Active'}</p>
                        </div>
                      </div>
                      <button onClick={() => setDetailedLog({ type: 'counseling', data: log })} className="px-4 py-2 bg-slate-900 hover:bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors w-full sm:w-auto">View</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
