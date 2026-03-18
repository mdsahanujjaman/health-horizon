import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FilePlus,
  LogOut,
  Stethoscope,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';
import NotificationBell from '../../components/NotificationBell';
import MedicalRecords from '../../components/MedicalRecords';
import { FileText, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments/my-appointments');
        setAppointments(response.data);
      } catch (err) {
        console.error('Failed to fetch appointments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, null, { params: { status } });
      // Update local state
      setAppointments(appointments.map((app) => (app.id === id ? { ...app, status } : app)));
    } catch (err) {
      console.error('Failed to update status', err);
      addToast('State transition failed. Retry operation.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [selectedChat, setSelectedChat] = useState(null);
  const [viewRecords, setViewRecords] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Reused */}
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
            to="/doctor/appointments"
            className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 rounded-xl font-medium"
          >
            <Calendar className="w-5 h-5" />
            Appointments
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
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
              <p className="text-gray-500">Manage your schedule and patient visits.</p>
            </div>
            <NotificationBell />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {appointments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No appointments scheduled</h3>
                <p className="text-gray-500">Your upcoming appointments will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <li key={apt.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{apt.patientName}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700'
                              : apt.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : apt.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(apt.appointmentTime).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 italic">"{apt.reason}"</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setSelectedChat({ id: apt.patientUserId, name: apt.patientName })
                          }
                          className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                        <button
                          onClick={() =>
                            setViewRecords({ id: apt.patientId, name: apt.patientName })
                          }
                          className="flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-lg hover:bg-sky-100 transition-colors border border-sky-200"
                        >
                          <FileText className="w-4 h-4" />
                          Records
                        </button>
                        {apt.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}
                              className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}
                              className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          </>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {viewRecords && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                onClick={() => setViewRecords(null)}
              ></div>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Medical Records</h3>
                    <p className="text-sm text-gray-500">Viewing history for {viewRecords.name}</p>
                  </div>
                  <button
                    onClick={() => setViewRecords(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                  <MedicalRecords patientId={viewRecords.id} isReadOnly={true} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedChat && (
        <ChatWindow
          currentUser={{ id: localStorage.getItem('userId') || 'doctor-id' }} // Need to store UserID in localStorage on login
          recipientId={selectedChat.id}
          recipientName={selectedChat.name}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;
