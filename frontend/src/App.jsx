import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import api from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/Landing'; // Import the new component
import PatientDashboard from './pages/patient/Dashboard';
import PatientProfile from './pages/patient/Profile';
import BookAppointment from './pages/patient/BookAppointment';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorProfile from './pages/doctor/Profile';
import DoctorAppointments from './pages/doctor/Appointments';
import IssuePrescription from './pages/doctor/IssuePrescription';
import DoctorMessaging from './pages/doctor/Messaging';
import AdminDashboard from './pages/admin/Dashboard';
import DoctorSearch from './pages/patient/DoctorSearch';
import PaymentProcess from './pages/patient/PaymentProcess';
import PillReminders from './pages/patient/PillReminders';
import PatientSupport from './pages/patient/Support';
import LabDashboard from './pages/lab/LabDashboard';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import RecordHandlerDashboard from './pages/handler/RecordHandlerDashboard';
import CompleteProfile from './pages/CompleteProfile';
import VerificationPending from './pages/VerificationPending';
import NotFound from './pages/NotFound';
import ProfileSettings from './pages/shared/ProfileSettings';

// Protected Route Wrapper (Basic)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ReminderDaemon />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/verification-pending"
          element={
            <ProtectedRoute>
              <VerificationPending />
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/search"
          element={
            <ProtectedRoute>
              <DoctorSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/payment"
          element={
            <ProtectedRoute>
              <PaymentProcess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/reminders"
          element={
            <ProtectedRoute>
              <PillReminders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/support"
          element={
            <ProtectedRoute>
              <PatientSupport />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/issue-prescription"
          element={
            <ProtectedRoute>
              <IssuePrescription />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* Lab Technician Routes */}
        <Route
          path="/lab/dashboard"
          element={
            <ProtectedRoute>
              <LabDashboard />
            </ProtectedRoute>
          }
        />

        {/* Counselor Routes */}
        <Route
          path="/counselor/dashboard"
          element={
            <ProtectedRoute>
              <CounselorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Record Handler Routes */}
        <Route
          path="/handler/dashboard"
          element={
            <ProtectedRoute>
              <RecordHandlerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/messaging"
          element={
            <ProtectedRoute>
              <DoctorMessaging />
            </ProtectedRoute>
          }
        />
        {/* Catch All - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function ReminderDaemon() {
  const [activeAlert, setActiveAlert] = useState(null);
  const lastNotifiedRef = useRef({});

  const playMedicalChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Tone 1 (A5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0, audioCtx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.6);

      // Tone 2 (C#6)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1109.73, audioCtx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.12);
      gain2.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc2.start(audioCtx.currentTime + 0.12);
      osc2.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn("Web Audio blocked:", e);
    }
  };

  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await api.get('/pill-reminders');
        const reminders = res.data;
        if (!reminders || reminders.length === 0) return;

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeString = `${currentHours}:${currentMinutes}`;

        reminders.forEach((reminder) => {
          const reminderTimeString = reminder.reminderTime.substring(0, 5);

          if (reminderTimeString === currentTimeString) {
            const cacheKey = `${reminder.id}-${currentTimeString}`;
            
            if (!lastNotifiedRef.current[cacheKey]) {
              lastNotifiedRef.current[cacheKey] = true;
              
              setActiveAlert(reminder);
              playMedicalChime();

              if (window.Notification && Notification.permission === 'granted') {
                new Notification(`💊 Time for your Medication!`, {
                  body: `${reminder.medicationName} (${reminder.dosage}) - ${reminder.foodInstruction || 'After Food'}`,
                  icon: '/favicon.ico'
                });
              }
            }
          }
        });
      } catch (err) {
        // Safe fail silently
      }
    };

    const interval = setInterval(checkReminders, 10000);
    checkReminders();

    return () => clearInterval(interval);
  }, []);

  if (!activeAlert) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 99999999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1rem', 
        backgroundColor: 'rgba(2, 6, 23, 0.8)', 
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      className="animate-in fade-in duration-300"
    >
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 via-primary to-violet-500 animate-pulse" />
        
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" />
          <Bell className="w-10 h-10 animate-bounce" />
        </div>

        <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Medication Reminder</h3>
        <h4 className="text-2xl font-black text-slate-900 leading-tight mb-4">
          Time for your dose!
        </h4>

        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-6 space-y-3">
          <div className="text-lg font-black text-slate-900">{activeAlert.medicationName}</div>
          
          <div className="flex justify-center items-center gap-4 text-xs font-black tracking-wider uppercase text-slate-400">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">{activeAlert.dosage}</span>
            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full">{activeAlert.foodInstruction || 'After Food'}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveAlert(null)}
            className="flex-1 bg-slate-150 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Snooze
          </button>
          
          <button
            onClick={() => {
              setActiveAlert(null);
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
                osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
                osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.4);
              } catch (e) {}

              // Persist log inside local storage
              try {
                const storageKey = 'medication_logs_all';
                const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const newLog = {
                  id: Date.now(),
                  reminderId: activeAlert.id,
                  medicationName: activeAlert.medicationName,
                  dosage: activeAlert.dosage,
                  reminderTime: activeAlert.reminderTime,
                  foodInstruction: activeAlert.foodInstruction || 'After Food',
                  takenAt: new Date().toISOString()
                };
                existingLogs.unshift(newLog);
                localStorage.setItem(storageKey, JSON.stringify(existingLogs));
                
                // Dispatch event for UI state refresh
                window.dispatchEvent(new Event('medicationLogsUpdated'));
              } catch (err) {
                console.error("Failed to write dose log", err);
              }
            }}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark Taken
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
