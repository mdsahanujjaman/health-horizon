import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FilePlus,
  LogOut,
  Stethoscope,
  Send,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Brain,
  Info,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';

const IssuePrescription = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    medications: '',
    instructions: '',
    internalObservations: '',
    isDiagnosisVisible: true,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAIAnalysis = async () => {
    if (!formData.diagnosis && !formData.medications) return;
    setAnalyzing(true);
    try {
      const res = await api.post('/ai/analyze', {
        symptoms: formData.diagnosis + ' ' + formData.medications,
      });
      setAiSuggestion(res.data);
    } catch (err) {
      console.error('AI Analysis failed', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/prescriptions', formData);
      setMessage({ type: 'success', text: 'Prescription issued successfully!' });
      setFormData({ patientId: '', diagnosis: '', medications: '', instructions: '' }); // Reset form
    } catch (err) {
      console.error('Failed to issue prescription', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to issue prescription. Verify Patient ID.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed md:relative h-full hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Stethoscope className="w-8 h-8" />
            Health Horizon
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/doctor/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/doctor/messaging"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Messages
          </Link>
          <Link
            to="/doctor/profile"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            <User className="w-5 h-5" />
            My Profile
          </Link>
          <Link
            to="/doctor/issue-prescription"
            className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 rounded-xl font-medium"
          >
            <FilePlus className="w-5 h-5" />
            Issue Prescription
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Issue Prescription</h2>
              <p className="text-gray-500">
                Create a new prescription for a patient with Level 4 Privacy Controls.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {message.text && (
                <div
                  className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID
                    </label>
                    <input
                      type="number"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                      placeholder="Patient ID"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="isDiagnosisVisible"
                        checked={formData.isDiagnosisVisible}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        {formData.isDiagnosisVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                        Diagnosis Visible to Patient
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                    <button
                      type="button"
                      onClick={handleAIAnalysis}
                      className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      Analyze with AI
                    </button>
                  </div>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Acute Bronchitis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medications
                  </label>
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Amoxicillin 500mg"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions (Visible to Patient)
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="Take one pill every 8 hours"
                  ></textarea>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-600 mb-1 flex items-center gap-1 uppercase tracking-wider">
                    <EyeOff className="w-3 h-3" />
                    Internal Observations (Doctor Only - Level 4)
                  </label>
                  <textarea
                    name="internalObservations"
                    value={formData.internalObservations}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary bg-white"
                    placeholder="Psychiatric notes, sensitive findings, etc."
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Issue Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: AI Assistance Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6" />
                AI Diagnostic Support
              </h3>

              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                  <p className="text-sm opacity-80">Analyzing symptoms...</p>
                </div>
              ) : aiSuggestion ? (
                <div className="space-y-4">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                    <p className="text-xs uppercase font-bold opacity-60 mb-1">
                      Possible Diagnosis
                    </p>
                    <p className="font-bold text-lg">{aiSuggestion.possibleDiagnosis}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                    <p className="text-xs uppercase font-bold opacity-60 mb-1">
                      Clinical Suggestion
                    </p>
                    <p className="text-sm">{aiSuggestion.suggestion}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-amber-400/20 p-3 rounded-xl border border-amber-400/30">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <p>{aiSuggestion.disclaimer}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm opacity-70">
                    Enter diagnosis or medications and click "Analyze with AI" for clinical
                    insights.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2">Ethics & Privacy</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Health Horizon adheres to Level 11 Ethical AI standards. All AI outputs must be
                verified by a licensed professional. Sensitive psychiatric data is encrypted and
                hidden from patient portals by default.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IssuePrescription;
