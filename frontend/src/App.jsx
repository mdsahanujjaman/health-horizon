import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <Router>
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

        {/* Catch All - 404 */}
        <Route path="*" element={<NotFound />} />
        <Route
          path="/doctor/messaging"
          element={
            <ProtectedRoute>
              <DoctorMessaging />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
