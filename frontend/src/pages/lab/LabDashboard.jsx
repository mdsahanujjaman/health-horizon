import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Upload,
  FileText,
  Loader2,
  LogOut,
  CheckCircle,
} from 'lucide-react';
import api from '../../services/api';
import NavProfile from '../../components/NavProfile';

const LabDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingTests, setPendingTests] = useState([]);
  const [uploading, setUploading] = useState(null);

  const fetchPendingTests = useCallback(async () => {
    try {
      const res = await api.get('/lab/pending');
      setPendingTests(res.data);
    } catch (err) {
      console.error('Failed to fetch tests', err);
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPendingTests();
  }, [fetchPendingTests]);

  const handleUpload = async (testId) => {
    setUploading(testId);
    try {
      // Simulated upload - in real app would be a file upload to S3/Cloudinary
      // and then saving the URL to our backend
      const mockUrl = `https://storage.healthhorizon.com/reports/report_${testId}.pdf`;
      await api.post(`/lab/upload/${testId}?reportUrl=${encodeURIComponent(mockUrl)}`);
      fetchPendingTests();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
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
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <FlaskConical className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                Health
              </h1>
              <span className="text-primary font-bold text-sm uppercase tracking-widest">Lab</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          <button className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1">
            <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110 text-primary" />
            Dashboard
          </button>
          {/* Add more nav items as needed */}
        </nav>

        <div className="p-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 relative overflow-hidden group mb-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">
              Technical
            </p>
            <p className="text-sm font-bold text-white relative z-10">Lab Standards v4.1</p>
            <button className="mt-4 text-xs font-black text-slate-900 bg-white px-4 py-2 rounded-xl hover:bg-cyan-500 hover:text-white transition-all relative z-10">
              Specs
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
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2 block animate-pulse">
                Diagnostic Operations Lead
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Lab Operations
              </h2>
              <p className="text-slate-500 font-medium mt-2">
                Precision diagnostic management environment.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-black text-sm uppercase tracking-widest text-slate-600">
                  Reports Pending
                </span>
                <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-black">
                  {pendingTests.length}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[3rem] overflow-hidden border-slate-200/50 animate-fade-in-up shadow-2xl hover-lift">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <FlaskConical className="w-7 h-7 text-primary" />
                Diagnostic Queue
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Real-time Feed
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingTests.length === 0 ? (
                <div className="p-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold italic text-xl">
                    Operational queue clear. No pending specify.
                  </p>
                </div>
              ) : (
                pendingTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-10 hover:bg-slate-50/80 transition-all border-b border-slate-100 last:border-0 group/row"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover/row:border-primary transition-all">
                            <FlaskConical className="w-7 h-7 text-slate-400 group-hover/row:text-primary" />
                          </div>
                          <div>
                            <h4 className="font-black text-2xl text-slate-900 tracking-tight">
                              {test.testName}
                            </h4>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-lg uppercase tracking-widest mt-1 inline-block">
                              Urgent Processing
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                              Subject
                            </p>
                            <p className="font-bold text-slate-900 text-lg">{test.patientName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                              Requester
                            </p>
                            <p className="font-bold text-slate-700">Dr. {test.doctorName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 lg:max-w-md space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 group-hover/row:border-primary/20 transition-all">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                              Test Metric
                            </label>
                            <input
                              type="text"
                              placeholder="E.g. 110 mg/dL"
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                              Clinical Trend
                            </label>
                            <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all appearance-none cursor-pointer">
                              <option>STABLE</option>
                              <option>IMPROVING</option>
                              <option>ATTENTION</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUpload(test.id)}
                          disabled={uploading === test.id}
                          className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-sm tracking-widest hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all disabled:opacity-50 relative overflow-hidden group/btn"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-primary/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                          {uploading === test.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 text-primary" /> Finalize Results
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                          Pipeline: Forwarded to Record Governance
                        </p>
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

export default LabDashboard;
