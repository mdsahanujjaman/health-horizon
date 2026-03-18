import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  FileCheck,
  FileX,
  Loader2,
  LogOut,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import NavProfile from '../../components/NavProfile';

const RecordHandlerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testsToVerify, setTestsToVerify] = useState([]);
  const [verifying, setVerifying] = useState(null);

  const fetchTestsToVerify = useCallback(async () => {
    try {
      const res = await api.get('/lab/to-verify');
      setTestsToVerify(res.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
      if (err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTestsToVerify();
  }, [fetchTestsToVerify]);

  const handleVerify = async (testId) => {
    setVerifying(testId);
    try {
      const verifierName = 'Compliance Officer'; // Mocked name
      await api.post(`/lab/verify/${testId}?verifierName=${encodeURIComponent(verifierName)}`);
      fetchTestsToVerify();
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setVerifying(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-emerald-100/50 flex flex-col hidden md:flex relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ShieldCheck className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                Guard
              </h1>
              <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest leading-none block mt-1">
                Registry
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3 mt-4">
          <button className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 translate-x-1">
            <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110" />
            Compliance Feed
          </button>
          {/* Placeholder for other Nav items */}
        </nav>

        <div className="p-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-6 rounded-[2.5rem] text-white relative overflow-hidden group mb-6 shadow-xl shadow-emerald-900/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">
              Authority Level
            </p>
            <p className="text-lg font-black relative z-10 leading-tight">
              Compliance
              <br />
              Officer
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
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none z-0 overflow-hidden">
          <img
            src="/src/artifacts/lab_precision_bg_1771267159349.png"
            className="w-full h-full object-cover grayscale"
            alt=""
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up mb-12">
            <div>
              <span className="text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">
                Level 7 Data Integrity
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Record
                <br />
                Governance
              </h2>
              <p className="text-slate-500 font-medium mt-3">
                Final compliance verification for clinical diagnostic output.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    Queue
                  </p>
                  <p className="text-2xl font-black text-emerald-600 leading-none">
                    {testsToVerify.length}
                  </p>
                </div>
                <div className="w-[1px] h-10 bg-slate-100"></div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    Avg Time
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none">12m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[3.5rem] overflow-hidden border-emerald-100/50 animate-fade-in-up shadow-2xl mb-12 hover-lift">
            <div className="p-10 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <FileCheck className="w-7 h-7 text-emerald-600" />
                Pending Verification Queue
              </h3>
              <div className="bg-white px-4 py-2 rounded-full border border-emerald-100 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  Active Pipeline
                </span>
              </div>
            </div>

            <div className="divide-y divide-emerald-50/50">
              {testsToVerify.length === 0 ? (
                <div className="p-32 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 className="w-12 h-12 text-emerald-200" />
                  </div>
                  <p className="text-slate-400 font-bold italic text-2xl">
                    Compliance threshold met. No pending items.
                  </p>
                </div>
              ) : (
                testsToVerify.map((test, i) => (
                  <div
                    key={test.id}
                    className="p-12 hover:bg-emerald-50/20 transition-all group/row relative overflow-hidden"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-6 mb-8">
                          <div className="w-16 h-16 bg-white border-2 border-emerald-50 rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover/row:border-emerald-500 transition-all">
                            <FileCheck className="w-8 h-8 text-emerald-100 group-hover/row:text-emerald-500 transition-colors" />
                          </div>
                          <div>
                            <h4 className="font-black text-3xl text-slate-900 tracking-tighter uppercase group-hover/row:text-emerald-600 transition-colors">
                              Test #{test.id}: {test.testName}
                            </h4>
                            <p className="text-slate-500 font-bold text-sm">
                              Subject Identification: {test.patientName}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-6 bg-white/50 rounded-[2rem] border border-emerald-100/50 shadow-inner group-hover/row:bg-white transition-colors">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">
                              Action Required
                            </span>
                            <p className="text-slate-700 font-black text-sm uppercase">
                              Verification of Step 6 Clinical Integrity
                            </p>
                          </div>
                          <div className="flex items-center gap-4 px-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map((j) => (
                                <div
                                  key={j}
                                  className="w-8 h-8 rounded-full bg-white border-2 border-emerald-50 flex items-center justify-center"
                                >
                                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                                </div>
                              ))}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Multi-signature Chain
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-end items-end gap-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Pipeline Step 4 Success
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Awaiting Stage 6
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-4 w-full lg:w-auto">
                          <a
                            href={test.labReportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 px-8 py-5 bg-white border-2 border-emerald-100 text-emerald-600 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-500/5 hover:-translate-y-1"
                          >
                            <ExternalLink className="w-5 h-5" />
                            Preview
                          </a>
                          <button
                            onClick={() => handleVerify(test.id)}
                            disabled={verifying === test.id}
                            className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all disabled:opacity-50 min-w-[220px] justify-center"
                          >
                            {verifying === test.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <FileCheck className="w-5 h-5 text-emerald-400" />
                                Authorize Step 6
                              </>
                            )}
                          </button>
                        </div>
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

export default RecordHandlerDashboard;
