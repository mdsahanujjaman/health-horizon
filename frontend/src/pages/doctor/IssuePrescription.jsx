import { useState, useEffect } from 'react';
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
  Search,
  Activity,
  Clock,
  PlusCircle,
  UserCheck,
  Calendar,
  CheckCircle,
  FlaskConical,
} from 'lucide-react';
import api from '../../services/api';
import NavProfile from '../../components/NavProfile';

const IssuePrescription = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    medications: '',
    instructions: '',
    internalObservations: '',
    isDiagnosisVisible: true,
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAllHistoryModal, setShowAllHistoryModal] = useState(false);

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
  const [consultedPatients, setConsultedPatients] = useState([]);
  const [activeDirTab, setActiveDirTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [emergencyForm, setEmergencyForm] = useState({
    fullName: '',
    age: '',
    gender: 'MALE',
    address: '',
    medicalConditions: '',
  });

  useEffect(() => {
    if (formData.patientId) {
      const match = formData.patientId.match(/HH-PAT-(\d+)/);
      const numId = match ? Number(match[1]) : Number(formData.patientId);
      if (!isNaN(numId)) {
        const hasPastScript = doctorPrescriptions.some(p => Number(p.patientId) === numId);
        if (hasPastScript) {
          setIsPreviewMode(true);
          return;
        }
      }
    }
    setIsPreviewMode(false);
  }, [formData.patientId, doctorPrescriptions]);

  const checkEarlyConsultation = (patientId) => {
    const patientScripts = doctorPrescriptions.filter(p => Number(p.patientId) === Number(patientId));
    if (patientScripts.length === 0) return null;

    const patientApts = allAppointments.filter(a => Number(a.patientId) === Number(patientId));
    if (patientApts.length === 0) return null;

    for (const script of patientScripts) {
      const consultDate = new Date(script.createdAt || script.prescriptionDate);
      const futureApt = patientApts.find(a => {
        const aptDate = new Date(a.appointmentTime);
        return consultDate.toDateString() !== aptDate.toDateString() && consultDate < aptDate;
      });
      if (futureApt) {
        return {
          consultDate: consultDate.toLocaleDateString(),
          appointmentDate: new Date(futureApt.appointmentTime).toLocaleDateString(),
          isEarly: true
        };
      }
    }

    const latestScript = [...patientScripts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const consultDate = new Date(latestScript.createdAt || latestScript.prescriptionDate);
    return {
      consultDate: consultDate.toLocaleDateString(),
      isEarly: false
    };
  };

  const filteredAppointments = appointments.filter(apt => {
    const patientScripts = doctorPrescriptions.filter(p => Number(p.patientId) === Number(apt.patientId));
    if (patientScripts.length === 0) return true;
    const aptCreatedAt = new Date(apt.createdAt || apt.appointmentTime);
    const hasPrescriptionAfterBooking = patientScripts.some(script => {
      const scriptCreatedAt = new Date(script.createdAt || script.prescriptionDate);
      return scriptCreatedAt >= aptCreatedAt;
    });
    return !hasPrescriptionAfterBooking;
  });

  const getSelectedPatientId = () => {
    if (!formData.patientId) return null;
    const match = formData.patientId.match(/HH-PAT-(\d+)/);
    if (match) return Number(match[1]);
    const num = Number(formData.patientId);
    return isNaN(num) ? null : num;
  };

  const selectedPatientId = getSelectedPatientId();
  const selectedPatientScripts = doctorPrescriptions.filter(
    (p) => Number(p.patientId) === Number(selectedPatientId)
  );

  const sortedScripts = [...selectedPatientScripts].sort(
    (a, b) => new Date(b.createdAt || b.prescriptionDate) - new Date(a.createdAt || a.prescriptionDate)
  );
  const latestScript = sortedScripts[0];

  useEffect(() => {
    const loadDirectory = async () => {
      try {
        const patientsRes = await api.get('/patients');
        setPatients(patientsRes.data || []);
      } catch (e) { console.log('No general patients list loaded'); }

      try {
        const appointmentsRes = await api.get('/appointments/my-appointments');
        const rawApts = appointmentsRes.data || [];
        setAllAppointments(rawApts);
        const upcoming = rawApts.filter(
          (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'PENDING'
        );
        upcoming.sort((a, b) => {
          return new Date(a.appointmentTime) - new Date(b.appointmentTime);
        });
        setAppointments(upcoming);
      } catch (e) { console.log('No upcoming appointments'); }

      try {
        const prescriptionsRes = await api.get('/prescriptions/my');
        const list = prescriptionsRes.data || [];
        setDoctorPrescriptions(list);
        const uniquePatients = [];
        const seen = new Set();
        for (const item of list) {
          const numId = Number(item.patientId);
          if (numId && !seen.has(numId)) {
            seen.add(numId);
            uniquePatients.push({
              id: numId,
              fullName: item.patientName || `Patient HH-PAT-${numId}`,
              email: item.patient?.user?.email,
              address: item.patient?.address,
              lastAppointmentDate: item.prescriptionDate || item.createdAt
            });
          }
        }
        setConsultedPatients(uniquePatients);
      } catch (e) { console.log('No past prescriptions'); }
    };

    loadDirectory();
  }, []);

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
      setFormData({ patientId: '', patientName: '', diagnosis: '', medications: '', instructions: '', internalObservations: '', isDiagnosisVisible: true }); // Reset form
      
      // Reload prescription directory dynamically
      try {
        const prescriptionsRes = await api.get('/prescriptions/my');
        const list = prescriptionsRes.data || [];
        setDoctorPrescriptions(list);
        const uniquePatients = [];
        const seen = new Set();
        for (const item of list) {
          const numId = Number(item.patientId);
          if (numId && !seen.has(numId)) {
            seen.add(numId);
            uniquePatients.push({
              id: numId,
              fullName: item.patientName || `Patient HH-PAT-${numId}`,
              email: item.patient?.user?.email,
              address: item.patient?.address,
              lastAppointmentDate: item.prescriptionDate || item.createdAt
            });
          }
        }
        setConsultedPatients(uniquePatients);
      } catch (e) { console.log('Failed to reload prescriptions after submit'); }

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
            { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
            { icon: MessageCircle, label: 'Messages', path: '/doctor/messaging' },
            { icon: User, label: 'My Profile', path: '/doctor/profile' },
            { icon: FilePlus, label: 'Issue Prescription', path: '/doctor/issue-prescription', active: true },
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
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Issue Prescription</h2>
            <p className="text-slate-500 font-medium mt-1">
              Create a new prescription for a patient with Level 4 Privacy Controls.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form & Directory */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Unified Patient Dispatcher Console */}
              <div className="rounded-[3rem] border border-sky-100/80 p-8 bg-gradient-to-br from-white via-sky-50/20 to-indigo-50/10 shadow-xl shadow-slate-200/50 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-xl border border-sky-200">
                      <UserCheck className="w-5 h-5 text-sky-600" />
                    </div>
                    Clinical Patient Directory
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">
                    Select a booked patient early (Pre-Date), retrieve a past consulted client, or register a new emergency patient.
                  </p>
                </div>

                {/* Tab Selector buttons */}
                <div className="flex flex-wrap bg-slate-100/80 p-2 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveDirTab('search')}
                    className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border ${
                      activeDirTab === 'search' 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 border-slate-900' 
                        : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    🔍 Search System
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDirTab('upcoming')}
                    className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border ${
                      activeDirTab === 'upcoming' 
                        ? 'bg-gradient-to-r from-sky-500 to-primary text-white shadow-xl shadow-sky-500/20 border-sky-500' 
                        : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    📅 Upcoming ({filteredAppointments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDirTab('past')}
                    className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border ${
                      activeDirTab === 'past' 
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/20 border-violet-500' 
                        : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    ✓ Past Consulted ({consultedPatients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDirTab('emergency')}
                    className={`flex-1 min-w-[120px] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border ${
                      activeDirTab === 'emergency' 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/20 border-red-500' 
                        : 'bg-white text-red-500 hover:bg-red-50/50 border-red-100'
                    }`}
                  >
                    🚨 Emergency
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="border-t border-slate-200/50 pt-6">
                  
                  {/* 1. SEARCH SYSTEM TAB */}
                  {activeDirTab === 'search' && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder="Search patient by name, email, address..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 bg-sky-50/20 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                        />
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                        {patients.filter(pat => {
                          const hasUpcoming = filteredAppointments.some(a => Number(a.patientId) === Number(pat.id));
                          const hasPast = consultedPatients.some(c => Number(c.id) === Number(pat.id));
                          const isRecentlySelected = formData.patientId === `HH-PAT-${pat.id}` || formData.patientId === String(pat.id);
                          return hasUpcoming || hasPast || isRecentlySelected;
                        }).filter(p => 
                          p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.address?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 ? (
                          <div className="p-12 text-center text-sm text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 italic">
                            No matching patient profiles found in the registry.
                          </div>
                        ) : (
                          patients.filter(pat => {
                            const hasUpcoming = filteredAppointments.some(a => Number(a.patientId) === Number(pat.id));
                            const hasPast = consultedPatients.some(c => Number(c.id) === Number(pat.id));
                            const isRecentlySelected = formData.patientId === `HH-PAT-${pat.id}` || formData.patientId === String(pat.id);
                            return hasUpcoming || hasPast || isRecentlySelected;
                          }).filter(p => 
                            p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.address?.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((pat) => {
                            const activeUpcoming = filteredAppointments.filter(a => Number(a.patientId) === Number(pat.id));
                            return (
                              <div
                                key={pat.id}
                                onClick={() => {
                                  setFormData({ ...formData, patientId: `HH-PAT-${pat.id}`, patientName: pat.fullName });
                                  setMessage({ type: 'success', text: `Selected: ${pat.fullName} (Registry ID: HH-PAT-${pat.id})` });
                                }}
                                className="clinical-box"
                              >
                                <div>
                                  <p className="font-bold text-slate-900 group-hover:text-primary transition-colors flex flex-wrap items-center gap-2">
                                    <span>{pat.fullName}</span>
                                    {activeUpcoming.length > 0 && (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-bold border border-amber-200/50">
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        Next: {new Date(activeUpcoming[0].appointmentTime).toLocaleDateString()}
                                      </span>
                                    )}
                                    {checkEarlyConsultation(pat.id) ? (
                                      checkEarlyConsultation(pat.id).isEarly ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200/50">
                                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                          Consulted Early: {checkEarlyConsultation(pat.id).consultDate}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200/50">
                                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                          Consulted: {checkEarlyConsultation(pat.id).consultDate}
                                        </span>
                                      )
                                    ) : pat.lastAppointmentDate ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-200/50">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        Last Appt: {new Date(pat.lastAppointmentDate).toLocaleDateString()}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg font-bold border border-slate-100">
                                        No past appointments
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-400 font-bold mt-1.5">
                                    Email: {pat.email || 'N/A'} | Address: {pat.address || 'N/A'}
                                  </p>
                                </div>
                                <span className="btn-select-action">
                                  Select
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. UPCOMING BOOKING TAB */}
                  {activeDirTab === 'upcoming' && (
                    <div className="space-y-4">
                      <p className="text-xs text-amber-700 font-bold bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Pre-Date Option: Select any upcoming scheduled booking below to consult them early.</span>
                      </p>
                      <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                        {filteredAppointments.length === 0 ? (
                          <div className="p-12 text-center text-sm text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 italic">
                            No upcoming bookings scheduled for today.
                          </div>
                        ) : (
                          filteredAppointments.map((apt, index) => (
                            <div
                              key={apt.id}
                              onClick={() => {
                                setFormData({ ...formData, patientId: `HH-PAT-${apt.patientId}`, patientName: apt.patientName, diagnosis: apt.medicalCondition || '' });
                                setMessage({ type: 'success', text: `Pre-Date Selection: Consulted ${apt.patientName} early (Registry ID: HH-PAT-${apt.patientId})` });
                              }}
                              className="clinical-box"
                            >
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                                  {index + 1}. {apt.patientName}
                                </p>
                                <p className="text-xs text-slate-400 font-bold mt-1.5">
                                  Appt: {new Date(apt.appointmentTime).toLocaleDateString()} at {new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Symptom: {apt.reason || 'N/A'}
                                </p>
                              </div>
                              <span className="btn-select-action group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-sky-500/20">
                                Consult Early
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. PAST CONSULTED TAB */}
                  {activeDirTab === 'past' && (
                    <div className="space-y-4">
                      <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                        {consultedPatients.length === 0 ? (
                          <div className="p-12 text-center text-sm text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 italic">
                            No previously consulted patients in your active history.
                          </div>
                        ) : (
                          consultedPatients.map((pat) => (
                            <div
                              key={pat.id}
                              onClick={() => {
                                setFormData({ ...formData, patientId: `HH-PAT-${pat.id}`, patientName: pat.fullName });
                                setMessage({ type: 'success', text: `Selected Consulted: ${pat.fullName} (Registry ID: HH-PAT-${pat.id})` });
                              }}
                              className="clinical-box"
                            >
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors flex flex-wrap items-center gap-2">
                                  <span>{pat.fullName}</span>
                                  {checkEarlyConsultation(pat.id) ? (
                                    checkEarlyConsultation(pat.id).isEarly ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200/50">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        Consulted Early: {checkEarlyConsultation(pat.id).consultDate}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200/50">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        Consulted: {checkEarlyConsultation(pat.id).consultDate}
                                      </span>
                                    )
                                  ) : null}
                                </p>
                                <p className="text-xs text-slate-400 font-bold mt-1.5">
                                  Patient Identifier Code: HH-PAT-{pat.id}
                                </p>
                              </div>
                              <span className="btn-select-action group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-violet-500/20">
                                Select
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. EMERGENCY PATIENT REGISTRY */}
                  {activeDirTab === 'emergency' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter patient full name"
                            value={emergencyForm.fullName}
                            onChange={(e) => setEmergencyForm({ ...emergencyForm, fullName: e.target.value })}
                            className="w-full px-5 py-3.5 bg-red-50/20 border border-red-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Age (Years)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 32"
                            value={emergencyForm.age}
                            onChange={(e) => setEmergencyForm({ ...emergencyForm, age: e.target.value })}
                            className="w-full px-5 py-3.5 bg-red-50/20 border border-red-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Gender
                          </label>
                          <select
                            value={emergencyForm.gender}
                            onChange={(e) => setEmergencyForm({ ...emergencyForm, gender: e.target.value })}
                            className="w-full px-5 py-3.5 bg-red-50/20 border border-red-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Resident Address
                          </label>
                          <input
                            type="text"
                            placeholder="Resident street and city"
                            value={emergencyForm.address}
                            onChange={(e) => setEmergencyForm({ ...emergencyForm, address: e.target.value })}
                            className="w-full px-5 py-3.5 bg-red-50/20 border border-red-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Medical Condition Details
                        </label>
                        <textarea
                          rows="2"
                          placeholder="Describe active clinical symptoms or emergency reasons..."
                          value={emergencyForm.medicalConditions}
                          onChange={(e) => setEmergencyForm({ ...emergencyForm, medicalConditions: e.target.value })}
                          className="w-full px-5 py-3.5 bg-red-50/20 border border-red-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all"
                        ></textarea>
                      </div>
                      
                      <button
                        type="button"
                        onClick={async () => {
                          if (!emergencyForm.fullName) {
                            return setMessage({ type: 'error', text: 'Patient name is required for Emergency dispatch.' });
                          }
                          try {
                            const res = await api.post('/patients/create-by-doctor', emergencyForm);
                            
                            setFormData({ 
                              ...formData, 
                              patientId: `HH-PAT-${res.data.id}`,
                              patientName: res.data.fullName,
                              diagnosis: emergencyForm.medicalConditions || ''
                            });
                            
                            setMessage({ 
                              type: 'success', 
                              text: `🚨 EMERGENCY REGISTERED: ${res.data.fullName} is successfully provisioned under Registry ID: HH-PAT-${res.data.id}! Auto-populated into prescription form below.` 
                            });

                            setEmergencyForm({ fullName: '', age: '', gender: 'MALE', address: '', medicalConditions: '' });
                            
                            const updated = await api.get('/patients');
                            setPatients(updated.data || []);

                          } catch (err) {
                            setMessage({ type: 'error', text: 'Failed to register Emergency patient. Please verify.' });
                          }
                        }}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/25 transition-all"
                      >
                        🚨 Quick Register & Select
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Form card */}
              <div className="rounded-[3rem] border border-sky-100/80 p-10 bg-gradient-to-br from-white via-sky-50/10 to-indigo-50/5 shadow-xl shadow-slate-200/50">
                {message.text && (
                  <div
                    className={`mb-8 p-5 rounded-2xl font-bold text-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}
                  >
                    {message.text}
                  </div>
                )}

                {isPreviewMode && latestScript ? (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-5 gap-4">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                          Clinical History Preview
                        </h4>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                          Most recent prescription issued for {formData.patientName || latestScript.patientName} on {new Date(latestScript.createdAt || latestScript.prescriptionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAllHistoryModal(true)}
                          className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          History ({selectedPatientScripts.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              diagnosis: latestScript.diagnosis || '',
                              medications: latestScript.medications || '',
                              instructions: latestScript.instructions || '',
                              internalObservations: latestScript.internalObservations || '',
                            });
                            setIsPreviewMode(false);
                            setMessage({ type: 'success', text: `Re-Issue: Populated form with details from prescription dated ${new Date(latestScript.createdAt || latestScript.prescriptionDate).toLocaleDateString()}.` });
                          }}
                          className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-widest rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Re-Issue/Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPreviewMode(false)}
                          className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Issue New
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-200/50">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                            Diagnosis / Clinical Summary
                          </span>
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 text-sm font-bold text-slate-800 shadow-sm leading-relaxed min-h-[60px]">
                            {latestScript.diagnosis || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                            Medications & Dosage
                          </span>
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 text-sm font-bold text-emerald-800 font-mono shadow-sm leading-relaxed whitespace-pre-line min-h-[80px]">
                            {latestScript.medications || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                            Instructions & Patient Advice
                          </span>
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 text-sm font-bold text-slate-500 shadow-sm leading-relaxed whitespace-pre-line min-h-[60px]">
                            {latestScript.instructions || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                            Internal Clinical Observations
                          </span>
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 text-sm font-bold text-indigo-600 shadow-sm leading-relaxed whitespace-pre-line min-h-[80px]">
                            {latestScript.internalObservations || 'No internal clinical observations recorded.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">
                      <span>Prescription Registry Code: HH-RX-{latestScript.id}</span>
                      <span>Consulted by: Dr. {latestScript.doctorName || 'Logged Doctor'}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Patient Registry ID
                        </label>
                        <input
                          type="text"
                          name="patientId"
                          value={formData.patientId}
                          onChange={handleChange}
                          required
                          className="w-full px-6 py-4 bg-sky-50/20 border border-slate-200 rounded-2xl text-sm font-mono font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                          placeholder="e.g. HH-PAT-3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex justify-between items-center">
                          <span>Patient Full Name</span>
                          <span className="text-[10px] text-primary uppercase font-black tracking-wider">(Editable)</span>
                        </label>
                        <input
                          type="text"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handleChange}
                          required
                          className="w-full px-6 py-4 bg-sky-50/20 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                    </div>

                    <div className="flex items-center pb-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="isDiagnosisVisible"
                          checked={formData.isDiagnosisVisible}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded-lg border-slate-300 focus:ring-primary"
                        />
                        <span className="text-sm text-slate-600 flex items-center gap-2 font-bold">
                          {formData.isDiagnosisVisible ? (
                            <Eye className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-rose-500" />
                          )}
                          Diagnosis Visible to Patient
                        </span>
                      </label>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Diagnosis</label>
                        <button
                          type="button"
                          onClick={handleAIAnalysis}
                          className="text-xs text-primary font-black flex items-center gap-1.5 hover:underline"
                        >
                          <Sparkles className="w-4 h-4 animate-bounce" />
                          Analyze with AI
                        </button>
                      </div>
                      <input
                        type="text"
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 bg-sky-50/20 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                        placeholder="e.g. Acute Bronchitis"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Medications
                      </label>
                      <textarea
                        name="medications"
                        value={formData.medications}
                        onChange={handleChange}
                        required
                        rows="2"
                        className="w-full px-6 py-4 bg-sky-50/20 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                        placeholder="e.g. Amoxicillin 500mg"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Instructions (Visible to Patient)
                      </label>
                      <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        required
                        rows="2"
                        className="w-full px-6 py-4 bg-sky-50/20 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                        placeholder="Take one pill every 8 hours"
                      ></textarea>
                    </div>

                    <div className="bg-rose-50/40 p-5 rounded-[2rem] border border-rose-100">
                      <label className="block text-xs font-black text-rose-700 mb-2 flex items-center gap-1.5 uppercase tracking-widest ml-1">
                        <EyeOff className="w-4 h-4 text-rose-500" />
                        Internal Observations (Doctor Only - Level 4 Confidentiality)
                      </label>
                      <textarea
                        name="internalObservations"
                        value={formData.internalObservations}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all"
                        placeholder="Sensitive findings, clinical insights, or psychiatric observations..."
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all disabled:opacity-50"
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
                )}
              </div>
            </div>

            {/* Right Column: AI Assistance Panel */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-violet-600 via-indigo-700 to-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="font-black text-xl mb-4 flex items-center gap-2.5 relative z-10">
                  <Brain className="w-6 h-6 animate-pulse" />
                  AI Diagnostic Support
                </h3>

                {analyzing ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin opacity-75" />
                    <p className="text-xs font-black uppercase tracking-wider opacity-85">Running Diagnostic Engine...</p>
                  </div>
                ) : aiSuggestion ? (
                  <div className="space-y-4 relative z-10">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
                        Possible Diagnosis
                      </p>
                      <p className="font-black text-lg">{aiSuggestion.possibleDiagnosis}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
                        Clinical Suggestion
                      </p>
                      <p className="text-sm font-bold leading-relaxed">{aiSuggestion.suggestion}</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-[10px] font-bold bg-amber-400/20 p-4 rounded-2xl border border-amber-400/30 leading-relaxed">
                      <Info className="w-4 h-4 flex-shrink-0 text-amber-300 mt-0.5" />
                      <p className="text-amber-200">{aiSuggestion.disclaimer}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 relative z-10">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50 text-indigo-200" />
                    <p className="text-xs font-bold opacity-80 leading-relaxed">
                      Enter diagnostic details or medication criteria and click "Analyze with AI" to generate clinical insights.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-white via-sky-50/20 to-indigo-50/10 p-8 rounded-[2.5rem] border border-sky-100/60 shadow-lg">
                <h4 className="font-black text-slate-900 flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-sky-100 rounded-lg">
                    <FlaskConical className="w-4 h-4 text-sky-600" />
                  </div>
                  Ethics & Privacy
                </h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  Health Horizon adheres to Level 11 Ethical AI standards. All AI outputs must be verified by a licensed clinical professional. Sensitive psychiatric logs are highly encrypted and hidden from consumer portals by default.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAllHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[3rem] max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
            
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  Prescription History Vault
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1.5">
                  Full historical records of prescriptions issued to {formData.patientName || (latestScript && latestScript.patientName)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllHistoryModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
              {sortedScripts.map((script, idx) => (
                <div
                  key={script.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      Record #{sortedScripts.length - idx} • HH-RX-{script.id}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 font-bold">
                        Issued: {new Date(script.createdAt || script.prescriptionDate).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            diagnosis: script.diagnosis || '',
                            medications: script.medications || '',
                            instructions: script.instructions || '',
                            internalObservations: script.internalObservations || '',
                          });
                          setIsPreviewMode(false);
                          setShowAllHistoryModal(false);
                          setMessage({ type: 'success', text: `Re-Issue: Populated form with details from prescription dated ${new Date(script.createdAt || script.prescriptionDate).toLocaleDateString()}.` });
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-slate-600 font-black uppercase transition-all"
                      >
                        Copy this
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                        Diagnosis
                      </span>
                      <p className="text-sm font-bold text-slate-800 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[40px]">
                        {script.diagnosis || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                        Medications
                      </span>
                      <p className="text-sm font-mono font-bold text-emerald-800 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line min-h-[40px]">
                        {script.medications || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                        Instructions
                      </span>
                      <p className="text-sm text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line min-h-[40px]">
                        {script.instructions || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 ml-1">
                        Observations
                      </span>
                      <p className="text-sm text-indigo-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line min-h-[40px]">
                        {script.internalObservations || 'No observations recorded.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllHistoryModal(false)}
                className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
              >
                Close History Vault
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuePrescription;
