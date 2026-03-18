import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  FileEdit,
  Save,
  Loader2,
  LogOut,
  CheckCircle,
  User,
  Filter,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import NavProfile from '../../components/NavProfile';

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [saving, setSaving] = useState(null);
  const [notes, setNotes] = useState('');
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [showFollowUp, setShowFollowUp] = useState(null);

  const fetchReferrals = useCallback(async () => {
    try {
      // In real app, we'd fetch by counselorId. For MVP demo, filtering patient 2
      const res = await api.get('/counseling/patient/2');
      setReferrals(res.data);
    } catch (err) {
      console.error('Failed to fetch referrals', err);
      if (err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleSaveNotes = async (referralId) => {
    setSaving(referralId);
    try {
      const counselorId = localStorage.getItem('userId');
      await api.post(
        `/counseling/session/${referralId}?notes=${encodeURIComponent(notes)}&counselorId=${counselorId}`
      );
      fetchReferrals();
      setNotes('');
    } catch (err) {
      console.error('Failed to save notes', err);
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-violet-100/50 flex flex-col hidden md:flex relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/20 relative overflow-hidden group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Brain className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                Mind
              </h1>
              <span className="text-violet-500 font-bold text-sm uppercase tracking-widest">
                Care
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          <button className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group bg-violet-600 text-white shadow-xl shadow-violet-600/20 translate-x-1">
            <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110" />
            Referral Queue
          </button>
          {/* Additional Navigation Items */}
        </nav>

        <div className="p-6">
          <div className="bg-gradient-to-br from-violet-500 to-rose-400 p-6 rounded-[2rem] text-white relative overflow-hidden group mb-6 shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">
              Support Level
            </p>
            <p className="text-lg font-black relative z-10 leading-tight">
              Expert Counselor
              <br />
              Level 6
            </p>
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
      <main className="flex-1 p-8 relative">
        {/* Background Asset */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.04] pointer-events-none z-0 overflow-hidden">
          <img
            src="/src/artifacts/counselor_zen_bg_1771267177703.png"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up mb-12">
            <div>
              <span className="text-violet-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">
                Empathetic Wellness Portal
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Wellbeing
                <br />
                Assessment
              </h2>
              <p className="text-slate-500 font-medium mt-3">
                Cultivating mental resilience through guided intervention.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-xl group hover:border-violet-200 transition-all cursor-pointer">
                <Filter className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[3.5rem] overflow-hidden border-violet-100/50 animate-fade-in-up shadow-2xl mb-12 hover-lift">
            <div className="p-10 border-b border-violet-50 bg-violet-50/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Brain className="w-7 h-7 text-violet-500" />
                  Referral Inbox
                </h3>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-violet-100 shadow-sm">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-400">
                    {referrals.length} Cases Pending
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-2xl border border-violet-100">
                {['ALL', 'KIDS', 'TEENS', 'ADULT'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAgeFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ageFilter === filter ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-violet-500 hover:bg-white'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-violet-50">
              {referrals.length === 0 ? (
                <div className="p-24 text-center">
                  <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-violet-200" />
                  </div>
                  <p className="text-slate-400 font-bold italic text-xl">
                    All minds are at peace. No referrals assigned.
                  </p>
                </div>
              ) : (
                referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-12 hover:bg-violet-50/20 transition-all border-b border-violet-50 last:border-0 group/row"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-12">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white border-2 border-violet-50 rounded-3xl flex items-center justify-center shadow-sm group-hover/row:border-violet-300 transition-all overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-rose-50 opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                            <User className="w-8 h-8 text-violet-300 group-hover/row:text-violet-500 relative z-10" />
                          </div>
                          <div>
                            <h4 className="font-black text-3xl text-slate-900 tracking-tighter group-hover/row:text-violet-600 transition-colors uppercase">
                              Patient {ref.patientName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-black rounded uppercase tracking-widest">
                                Priority II
                              </span>
                              <p className="text-slate-400 text-xs font-bold italic">
                                Source: Dr. {ref.doctorName}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-8 bg-white/50 rounded-[2.5rem] border border-violet-100/50 shadow-inner group-hover/row:bg-white transition-colors">
                          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3 block">
                            Clinical Indication
                          </span>
                          <p className="text-slate-700 font-bold text-lg leading-relaxed italic">
                            "{ref.reason}"
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 lg:max-w-md space-y-6">
                        {ref.status === 'PENDING' ? (
                          <div className="space-y-6 animate-fade-in">
                            <div className="relative group/text">
                              <textarea
                                className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:ring-8 focus:ring-violet-500/5 focus:border-violet-300 focus-aura outline-none transition-all h-48 text-slate-700 font-bold shadow-inner placeholder:text-slate-300"
                                placeholder="Craft your therapeutic synthesis..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              ></textarea>
                              <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest group-focus-within/text:text-violet-400">
                                Zen Editor
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleSaveNotes(ref.id)}
                                disabled={saving === ref.id || !notes.trim()}
                                className="flex-1 group/btn relative h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-sm tracking-widest hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all overflow-hidden disabled:opacity-50"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-rose-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                  {saving === ref.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Save className="w-5 h-5 text-violet-400" />
                                  )}
                                  Finalize Session
                                </div>
                              </button>
                              <button
                                onClick={() => setShowFollowUp(ref.id)}
                                className="w-16 h-16 bg-white border-2 border-violet-100 text-violet-500 rounded-[1.5rem] flex items-center justify-center hover:bg-violet-50 transition-all shadow-xl shadow-violet-500/5 hover:-translate-y-1"
                              >
                                <Calendar className="w-6 h-6" />
                              </button>
                            </div>

                            {showFollowUp === ref.id && (
                              <div className="p-8 bg-gradient-to-br from-violet-50 to-rose-50 rounded-[2.5rem] border border-violet-100 animate-fade-in-up">
                                <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" /> Continuity of Care Schedule
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                  {['Tomorrow', 'In 3 Days', 'Next Week'].map((time) => (
                                    <button
                                      key={time}
                                      className="px-5 py-3 bg-white border-2 border-white rounded-2xl text-xs font-black text-violet-600 shadow-sm hover:border-violet-300 hover:shadow-md transition-all"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border-2 border-emerald-100 relative overflow-hidden group/final">
                            <div className="absolute top-0 right-0 p-4">
                              <CheckCircle className="w-8 h-8 text-emerald-200" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 block">
                              Outcome Synthesis
                            </span>
                            <p className="text-slate-700 font-bold leading-relaxed">
                              {ref.sessionNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CounselorDashboard;
