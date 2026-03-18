import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
  UserCheck,
  UserPlus,
  TrendingUp,
  DollarSign,
  LogOut,
  Settings,
  History,
  Briefcase,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api, { getImageUrl } from '../../services/api';
import NotificationBell from '../../components/NotificationBell';
import { useToast } from '../../hooks/useToast';
import StatsCard from '../../components/ui/StatsCard';
import NavProfile from '../../components/NavProfile';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [auditLogs] = useState([
    {
      id: 1,
      userEmail: 'dr.smith@health.com',
      action: 'VIEW_RECORD',
      resourceId: 'Patient #12',
      timestamp: '2026-02-16 10:30',
    },
    {
      id: 2,
      userEmail: 'lab.tech@health.com',
      action: 'UPLOAD_REPORT',
      resourceId: 'Test #45',
      timestamp: '2026-02-16 11:15',
    },
  ]);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending USERS (all roles) instead of just doctors
        const pendingUsersRes = await api.get('/admin/users/pending');
        setPendingUsers(pendingUsersRes.data);

        const analyticsRes = await api.get('/analytics/admin');
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
        if (err.response?.status === 403) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleVerify = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/verify`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast('User account verified successfully.', 'success');
    } catch (err) {
      console.error('Failed to verify user', err);
      addToast('Verification failed. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/reject`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast('User account rejected.', 'success');
    } catch (err) {
      console.error('Failed to reject user', err);
      addToast('Rejection failed. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

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
    <div className="min-h-screen bg-slate-50">
      {/* Governance Header */}
      <nav className="bg-slate-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-widest uppercase">
                  Registry
                </h1>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none block -mt-1">
                  Governance Portal
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  System Online
                </span>
              </div>
              <NotificationBell />
              <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

              <div className="flex items-center gap-4 text-white">
                <NavProfile />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <LogOut className="w-4 h-4" />
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-6 lg:px-10 relative">
        {/* Background Asset */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0 overflow-hidden">
          <img
            src="/src/artifacts/admin_governance_bg_1771267200976.png"
            className="w-full h-full object-cover grayscale"
            alt=""
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in-up">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">
              Level 7 Authorization Required
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Governance Dashboard
            </h2>
            <p className="text-slate-500 font-medium mt-3">
              Monitoring platform equilibrium and professional verification vectors.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
              Real-time
            </button>
            <button className="px-6 py-3 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest">
              Historical
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            {
              label: 'Total Patients',
              value: analytics?.totalPatients || 0,
              icon: UserPlus,
              tone: 'blue',
            },
            {
              label: 'Verified Doctors',
              value: analytics?.totalDoctors || 0,
              icon: UserCheck,
              tone: 'indigo',
            },
            {
              label: 'Success Ledger',
              value: analytics?.totalAppointments || 0,
              icon: CheckCircle,
              tone: 'emerald',
            },
            {
              label: 'Annual Revenue',
              value: `$${analytics?.totalRevenue || '0.00'}`,
              icon: DollarSign,
              tone: 'rose',
            },
          ].map((stat, i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <StatsCard label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
            </div>
          ))}
        </div>

        {/* Main Operations Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-slate-200/50 animate-fade-in-up hover-lift">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-primary" />
                  Lifecycle Distribution
                </h3>
                <p className="text-slate-400 font-bold text-sm mt-1">
                  Cross-platform appointment status breakdown
                </p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    analytics
                      ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({
                        name,
                        value,
                      }))
                      : []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '24px',
                      border: 'none',
                      boxShadow: '0 20px 40px -10px rgba(15,23,42,0.1)',
                      padding: '16px',
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#0EA5E9" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
              <Settings className="w-7 h-7 text-primary" />
              AI Directives
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <div>
                  <p className="font-black text-white uppercase tracking-widest text-[10px] mb-1">
                    Diagnostic AI
                  </p>
                  <p className="text-xs text-slate-400 font-bold">Heuristic assistance engine</p>
                </div>
                <button
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`w-14 h-7 rounded-full transition-all relative ${aiEnabled ? 'bg-primary shadow-[0_0_20px_rgba(14,165,233,0.5)]' : 'bg-slate-700'}`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all transform ${aiEnabled ? 'translate-x-8' : 'translate-x-1'}`}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 opacity-50">
                <div>
                  <p className="font-black text-white uppercase tracking-widest text-[10px] mb-1">
                    Neural Routing
                  </p>
                  <p className="text-xs text-slate-400 font-bold">Auto-dispatch algorithms</p>
                </div>
                <div className="w-14 h-7 bg-primary rounded-full relative shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                  <div className="absolute top-1 left-8 w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
              <button className="w-full py-5 bg-white text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-white transition-all">
                Commit Changes
              </button>
            </div>
          </div>
        </div>

        {/* Audit & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 glass-card rounded-[3rem] overflow-hidden border-slate-200/50 animate-fade-in-up hover-lift">
            <div className="p-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <History className="w-6 h-6 text-amber-500" />
                Chain of Custody Audit
              </h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                Export Registry
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log, i) => (
                <div
                  key={log.id}
                  className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group/audit"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 shadow-sm group-hover/audit:border-primary group-hover/audit:text-primary transition-all">
                      {log.userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">
                        {log.action}
                      </p>
                      <p className="text-sm text-slate-500 font-bold">
                        {log.userEmail} <span className="text-slate-300 mx-2">•</span>{' '}
                        {log.resourceId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                      Transaction ID #{2940 + i}
                    </p>
                    <p className="text-xs text-slate-400 font-mono font-bold">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 glass-card p-10 rounded-[3rem] border-slate-200/50 flex flex-col items-center justify-center">
            <h3 className="text-xl font-black text-slate-900 mb-8 w-full text-center">
              Engagement Balance
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Patients', value: analytics?.totalPatients || 0 },
                      { name: 'Doctors', value: analytics?.totalDoctors || 0 },
                    ]}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#0EA5E9" />
                    <Cell fill="#8B5CF6" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Growth
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Retention
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operations: Verification */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Credentials Pipeline
              </h2>
              <p className="text-slate-500 font-medium">
                Authentication required for clinical practitioner access.
              </p>
            </div>
            <div className="px-6 py-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                {pendingUsers.length} Verification Tasks
              </span>
            </div>
          </div>

          <div className="glass-card rounded-[3rem] overflow-hidden border-slate-200/50 shadow-2xl hover-lift">
            {pendingUsers.length === 0 ? (
              <div className="p-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                  Governance Equilibrium
                </h3>
                <p className="text-slate-400 font-bold italic text-lg">
                  All practitioner credentials have been verified.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {pendingUsers.map((user, i) => (
                  <li
                    key={user.id}
                    className="p-10 mb-6 gradient-border gradient-border-hover overflow-hidden transition-all group/li"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                            {user.profilePictureUrl ? (
                              <img
                                src={getImageUrl(user.profilePictureUrl)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-primary font-black text-xl">
                                {user.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .substring(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                              {user.fullName}
                            </h3>
                            <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-1">
                              {user.role.replace('_', ' ')} Applicant
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div className="p-4 bg-white/50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              Email Coordinates
                            </p>
                            <p className="font-bold text-slate-700">{user.email}</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              Requested Role
                            </p>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <p className="font-bold text-slate-700">{user.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => handleVerify(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all disabled:opacity-50 group/btn-v"
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-emerald-400 group-hover/btn-v:text-white" />
                          )}
                          Authorize Access
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center justify-center gap-3 bg-white border-2 border-rose-50 text-rose-500 px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-rose-50 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5" /> Deny Credentials
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main >
    </div >
  );
};

export default AdminDashboard;
