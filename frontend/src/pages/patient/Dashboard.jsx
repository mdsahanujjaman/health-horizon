import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  LogOut,
  Activity,
  Heart,
  Calendar,
  Loader2,
  MessageCircle,
  Clock,
  TrendingUp,
  ShieldAlert,
  FlaskConical,
  Brain,
  WifiOff,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Mic,
  Plus,
  Baby,
  Briefcase,
  Dumbbell,
  Flower2,
  Grape,
  Volume2,
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
import api, { getImageUrl } from '../../services/api';
import ChatWindow from '../../components/ChatWindow';
import NotificationBell from '../../components/NotificationBell';
import MedicalRecords from '../../components/MedicalRecords';
import PatientSidebar from '../../components/PatientSidebar';
import StatsCard from '../../components/ui/StatsCard';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [isLowData, setIsLowData] = useState(false);
  const [activeConditions] = useState([
    { id: 1, name: 'Diabetes', status: 'IMPROVING', color: 'emerald', value: '110', unit: 'mg/dL' },
    { id: 2, name: 'Stress', status: 'ATTENTION', color: 'amber', value: '7/10', unit: '' },
  ]);
  const [aiInsight] = useState(
    'Your sugar levels have been stable for 2 weeks. Keep going 👍'
  );

  const getPersona = () => {
    const age = profile?.age || 30;
    const gender = profile?.gender || 'MALE';
    if (age < 13) return 'KIDS';
    if (age > 65) return 'ELDERLY';
    if (gender === 'FEMALE') return 'WOMEN';
    if (gender === 'MALE') return 'MEN';
    return 'ADULT';
  };

  const persona = getPersona();
  const isElderly = persona === 'ELDERLY';
  const isKids = persona === 'KIDS';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/patients/me');
        setProfile(profileRes.data);
        const prescriptionsRes = await api.get('/prescriptions/my-prescriptions');
        setPrescriptions(prescriptionsRes.data);

        const appointmentsRes = await api.get('/appointments/my-appointments');
        setAppointments(appointmentsRes.data);

        const labRes = await api.get(`/lab/patient/${profileRes.data.id}`);
        setLabResults(labRes.data);

        // const counselingRes = await api.get(`/counseling/patient/${profileRes.data.id}`);
        // setCounseling(counselingRes.data); // Removed unused setter
      } catch (err) {
        console.error('Failed to fetch data', err);
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return 'N/A';
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isElderly ? 'text-xl' : 'text-base'} bg-gray-50`}>
      {!isKids && <PatientSidebar />}

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Background Asset */}
        <div className="absolute top-0 right-0 w-full h-[500px] opacity-[0.03] pointer-events-none z-0 overflow-hidden">
          <img
            src="/src/artifacts/wellness_abstract_art_1771265247696.png"
            className="w-full h-full object-cover grayscale"
            alt=""
          />
        </div>

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2 block animate-pulse">
                Live Health Status
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Hello, {profile?.user?.fullName?.split(' ')[0] || 'Patient'}
              </h2>
              <p className="text-slate-500 font-medium mt-2">
                Your personalized wellness report for today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLowData(!isLowData)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all border shadow-sm group ${isLowData ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-400 hover:border-primary hover:text-primary'}`}
                title="Low-Data Rural Mode (Level 0)"
              >
                <WifiOff
                  className={`transition-transform group-hover:scale-110 ${isKids ? 'w-8 h-8' : 'w-5 h-5'}`}
                />
                <span className={isKids ? 'text-lg' : 'text-sm'}>
                  {isLowData ? 'Low Data ON' : 'Low Data Mode'}
                </span>
              </button>
              {isElderly && (
                <button className="flex items-center gap-3 px-8 py-4 bg-white border-4 border-primary text-primary rounded-[2rem] animate-pulse shadow-xl shadow-primary/20">
                  <Volume2 className="w-8 h-8" />
                  <span className="font-black text-xl">Voice Help</span>
                </button>
              )}
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="hidden lg:flex items-center gap-3 bg-white/70 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-slate-200/50 hover-lift cursor-default">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-slate-700 font-bold">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SOS Alert */}
          {sosTriggered && (
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] animate-fade-in-up relative overflow-hidden border border-white/10 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                    <ShieldAlert className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">
                      Emergency Signal Active
                    </h3>
                    <p className="text-xl text-slate-400 font-bold mt-1">
                      LIFESAVER mode engaged • Responders in route
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSosTriggered(false)}
                  className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-sm shadow-2xl hover:bg-slate-100 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  Cancel Alert
                </button>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-10 border-t border-white/10">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">
                    Primary Dispatch
                  </p>
                  <p className="text-2xl font-black">Central EMS Dispatch</p>
                  <p className="text-slate-400 font-bold mt-1 italic">ETA: 4-6 minutes</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
                    Medical Records
                  </p>
                  <p className="text-2xl font-black">History Synced</p>
                  <p className="text-slate-400 font-bold mt-1 italic">Shared with responders</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: 'BMI Index',
                value: calculateBMI(profile?.height, profile?.weight),
                icon: Activity,
                tone: 'primary',
                unit: '',
              },
              {
                label: 'Body Weight',
                value: profile?.weight || '--',
                icon: User,
                tone: 'emerald',
                unit: 'kg',
              },
              {
                label: 'Patient Age',
                value: profile?.age || '--',
                icon: Clock,
                tone: 'amber',
                unit: 'yrs',
              },
            ].map((stat, i) => (
              <StatsCard
                key={i}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                icon={stat.icon}
                tone={stat.tone}
                size={isElderly ? 'large' : 'normal'}
              />
            ))}

            <button
              onClick={() => setSosTriggered(true)}
              className="relative overflow-hidden group p-8 rounded-[2.5rem] bg-slate-900 text-white flex flex-col items-center justify-center gap-3 transition-all hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ShieldAlert className="w-10 h-10 relative z-10 group-hover:scale-110 transition-transform" />
              <span
                className={`relative z-10 font-black tracking-widest text-xs uppercase ${isElderly ? 'text-sm' : ''}`}
              >
                Execute SOS
              </span>
            </button>
          </div>

          {/* Adaptive Blocks based on Persona */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {persona === 'WOMEN' && (
              <>
                {[
                  {
                    icon: Flower2,
                    label: 'Gynecology',
                    desc: 'Track cycles & consult specialists.',
                    tone: 'pink',
                  },
                  {
                    icon: Brain,
                    label: 'Mental Health',
                    desc: 'Daily meditation & anxiety tracking.',
                    tone: 'purple',
                  },
                  {
                    icon: Grape,
                    label: 'Nutrition',
                    desc: 'Personalized diet plans for wellness.',
                    tone: 'emerald',
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className={`glass-card p-8 rounded-[2.5rem] border-${m.tone}-100/50 hover-lift group animate-fade-in-up`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div
                      className={`w-14 h-14 bg-${m.tone}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <m.icon className={`w-7 h-7 text-${m.tone}-500`} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{m.label}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
                      {m.desc}
                    </p>
                    <button
                      className={`mt-6 w-full py-3 bg-${m.tone}-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-${m.tone}-500/30 hover:shadow-${m.tone}-500/50 transition-all`}
                    >
                      Explore
                    </button>
                  </div>
                ))}
              </>
            )}

            {persona === 'MEN' && (
              <>
                {[
                  {
                    icon: Activity,
                    label: 'Lifestyle Health',
                    desc: 'Sleep & activity synchronization.',
                    tone: 'blue',
                  },
                  {
                    icon: Dumbbell,
                    label: 'Stress & Fitness',
                    desc: 'Workload balance & fitness goals.',
                    tone: 'orange',
                  },
                  {
                    icon: Briefcase,
                    label: 'Career Guidance',
                    desc: 'Mindfulness for professionals.',
                    tone: 'indigo',
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className={`glass-card p-8 rounded-[2.5rem] border-${m.tone}-100/50 hover-lift group animate-fade-in-up`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div
                      className={`w-14 h-14 bg-${m.tone}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <m.icon className={`w-7 h-7 text-${m.tone}-500`} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{m.label}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
                      {m.desc}
                    </p>
                    <button
                      className={`mt-6 w-full py-3 bg-${m.tone}-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-${m.tone}-500/30 hover:shadow-${m.tone}-500/50 transition-all`}
                    >
                      Optimize
                    </button>
                  </div>
                ))}
              </>
            )}

            {persona === 'KIDS' && (
              <div className="md:col-span-3 bg-gradient-to-br from-yellow-100 via-orange-50 to-rose-50 p-12 rounded-[4rem] border-8 border-white shadow-2xl flex flex-col items-center text-center space-y-10 animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-orange-500/10 inline-block mb-6 hover-lift cursor-pointer">
                    <Baby className="w-24 h-24 text-orange-500 animate-bounce" />
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tight">
                    Hi {profile?.user?.fullName?.split(' ')[0] || 'Buddy'}! 🌟
                  </h3>
                  <p className="text-2xl text-slate-600 font-bold max-w-lg mx-auto mt-4">
                    Level Up your health today with some super fun quests!
                  </p>
                </div>
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                  {[
                    { emoji: '🍎', label: 'Eat Yummy', tone: 'rose' },
                    { emoji: '🏃', label: 'Play More', tone: 'sky' },
                    { emoji: '🦷', label: 'Brush Teeth', tone: 'emerald' },
                    { emoji: '💤', label: 'Sleep Time', tone: 'purple' },
                  ].map((q, i) => (
                    <button
                      key={i}
                      className="group bg-white p-8 rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-all border-b-[12px] border-slate-100 active:border-b-0 hover:border-slate-200"
                    >
                      <span className="text-6xl block group-hover:scale-125 transition-transform">
                        {q.emoji}
                      </span>
                      <p className={`font-black text-lg mt-4 text-slate-700`}>{q.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isKids && (
            <>
              {/* Medical Conditions */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
                <h3
                  className={`text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 ${isElderly ? 'text-2xl' : ''}`}
                >
                  <Heart className="w-6 h-6 text-red-400" />
                  Medical Conditions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile?.medicalConditions ? (
                    profile.medicalConditions.split(',').map((condition, idx) => (
                      <span
                        key={idx}
                        className={`px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 ${isElderly ? 'text-2xl' : 'text-lg'}`}
                      >
                        {condition.trim()}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No chronic conditions listed.</p>
                  )}
                </div>
              </div>

              {/* Step 3/10: Dynamic Condition Blocks */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xl font-bold text-gray-900 flex items-center gap-2 ${isElderly ? 'text-2xl' : ''}`}
                  >
                    <Activity className="w-6 h-6 text-primary" />
                    Your Health Conditions
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                    <Plus className="w-4 h-4" />
                    Log Vitals
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeConditions.map((cond) => (
                    <div
                      key={cond.id}
                      className={`bg-white p-6 rounded-3xl shadow-sm border border-${cond.color}-50 hover:shadow-md transition-shadow cursor-pointer group`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4
                            className={`text-lg font-bold text-gray-900 ${isElderly ? 'text-xl' : ''}`}
                          >
                            {cond.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            {cond.status === 'IMPROVING' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            )}
                            <span
                              className={`text-sm font-bold ${cond.status === 'IMPROVING' ? 'text-emerald-500' : 'text-amber-500'}`}
                            >
                              {cond.status === 'IMPROVING' ? 'Improving ✅' : 'Needs attention ⚠️'}
                            </span>
                          </div>
                        </div>
                        <div className={`p-3 bg-${cond.color}-50 rounded-2xl`}>
                          <BarChart2 className={`w-6 h-6 text-${cond.color}-500`} />
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 100 }} className="mb-4">
                        <ResponsiveContainer>
                          <LineChart
                            data={[
                              { v: 100 },
                              { v: 105 },
                              { v: 98 },
                              { v: 112 },
                              { v: cond.value.includes('/') ? 7 : cond.value },
                            ]}
                          >
                            <Line
                              type="monotone"
                              dataKey="v"
                              stroke={cond.color === 'emerald' ? '#10B981' : '#F59E0B'}
                              strokeWidth={3}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p
                            className={`${isElderly ? 'text-3xl' : 'text-2xl'} font-black text-gray-900`}
                          >
                            {cond.value}{' '}
                            <span className="text-sm font-bold text-gray-400">{cond.unit}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
                            Historical Trend
                          </p>
                        </div>
                        <button className="text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Full History →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 12: AI Companion */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group border border-white/5 border-t-primary/50 animate-fade-in-up">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-premium rounded-3xl flex items-center justify-center border border-white/10 shadow-[0_0_40px_rgba(14,165,233,0.3)] group-hover:rotate-6 transition-transform">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">
                        Neural Insight
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Real-time Analysis
                      </span>
                    </div>
                    <p
                      className={`${isElderly ? 'text-3xl' : 'text-2xl'} font-black text-white italic tracking-tight leading-snug`}
                    >
                      "{aiInsight}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 1: Input Section */}
              <div className="p-1 gradient-border shadow-2xl shadow-cyan-500/10 animate-fade-in-up">
                <div className="bg-white rounded-[2.4rem] p-10 hover-lift group">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="space-y-2 text-center lg:text-left">
                      <h3
                        className={`text-3xl font-black text-slate-900 tracking-tight ${isElderly ? 'text-4xl' : ''}`}
                      >
                        Feeling unwell?
                      </h3>
                      <p className="text-slate-500 font-medium">
                        Log your symptoms for high-precision AI diagnostics.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1 max-w-2xl">
                      <div className="relative flex-1 group">
                        <input
                          type="text"
                          placeholder="Describe how you feel..."
                          className="w-full pl-8 pr-16 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white shadow-md text-primary hover:text-sky-600 rounded-2xl transition-all">
                          <Mic className="w-5 h-5" />
                        </button>
                      </div>
                      <button className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all relative overflow-hidden group/btn">
                        <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        <span className="relative z-10">Analyze</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <div className="gradient-border overflow-hidden flex flex-col group animate-fade-in-up">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Appointments
                    </h3>
                    <Link
                      to="/patient/book-appointment"
                      className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                    >
                      Schedule
                    </Link>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-slate-50">
                    {appointments.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 font-medium italic">
                        No sessions scheduled.
                      </div>
                    ) : (
                      appointments.map((apt) => (
                        <div key={apt.id} className="p-8 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                                {apt.doctorProfilePictureUrl ? (
                                  <img
                                    src={getImageUrl(apt.doctorProfilePictureUrl)}
                                    alt={apt.doctorName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '';
                                    }}
                                  />
                                ) : (
                                  <span className="text-primary font-black text-xs uppercase">
                                    {apt.doctorName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .substring(0, 2)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-slate-900">
                                  Dr. {apt.doctorName}
                                </h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                  {apt.doctorSpecialization}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setSelectedChat({ id: apt.doctorUserId, name: 'Dr. ' + apt.doctorName })
                              }
                              className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary rounded-2xl shadow-sm transition-all"
                            >
                              <MessageCircle className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Prescriptions */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col group animate-fade-in-up animation-delay-100">
                  <div className="p-8 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      Prescriptions
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-slate-50">
                    {prescriptions.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 font-medium italic">
                        Clear for now.
                      </div>
                    ) : (
                      prescriptions.map((script) => (
                        <div
                          key={script.id}
                          className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">
                              {script.medications}
                            </h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {script.prescriptionDate}
                            </p>
                          </div>
                          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Lab Reports */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col group animate-fade-in-up animation-delay-200">
                  <div className="p-8 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-indigo-500" />
                      Diagnostics
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-slate-50">
                    {labResults.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 font-medium italic">
                        No lab activity.
                      </div>
                    ) : (
                      labResults.map((test) => (
                        <div key={test.id} className="p-8 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">{test.testName}</h4>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Status: {test.status}
                              </p>
                            </div>
                            {test.status === 'COMPLETED' ? (
                              <a
                                href={test.labReportUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-2xl shadow-sm transition-all"
                              >
                                <FileText className="w-6 h-6" />
                              </a>
                            ) : (
                              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="gradient-border p-10 overflow-hidden animate-fade-in-up animation-delay-300">
                <MedicalRecords patientId={profile?.id} />
              </div>
            </>
          )}
        </div>
      </main>

      {selectedChat && (
        <ChatWindow
          currentUser={{ id: localStorage.getItem('userId') || 'patient-id' }}
          recipientId={selectedChat.id}
          recipientName={selectedChat.name}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
