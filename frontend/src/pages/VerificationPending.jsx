import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Upload, FileText, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import api from '../services/api';

const VerificationPending = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/doctors/upload-credential', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploaded(true);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50">
      {/* Background elements similar to auth pages */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-soft opacity-50"></div>

      <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-xl shadow-amber-500/10">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Verification Required
          </h2>
          <p className="mt-4 text-slate-500 font-medium text-lg max-w-lg mx-auto">
            To maintain clinical integrity, all professional accounts must be verified by the
            governance board.
          </p>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-200/60">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4">
                  Current Status
                </h3>
                <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="font-bold text-sm">Pending Review</span>
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
                  Your application is currently in the queue. Standard review time is 24-48 hours.
                  You will be notified via email upon approval.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" />
                Return to Login
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 h-full flex flex-col">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4">
                  Identity Proof
                </h3>

                {uploaded ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in-up">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900">Documents Submitted</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Our team is reviewing your credentials.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <input
                      type="file"
                      id="credential-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="credential-upload"
                      className="border-2 border-dashed border-blue-200 rounded-xl flex-1 flex flex-col items-center justify-center p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {file ? file.name : 'Upload Credentials'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Medical License / ID Proof (PDF, JPG)
                      </p>
                    </label>

                    {error && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 text-center">{error}</p>
                    )}

                    <button
                      onClick={handleUpload}
                      disabled={uploading || !file}
                      className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit Documents'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Health Horizon Governance Board
        </p>
      </div>
    </div>
  );
};

export default VerificationPending;
