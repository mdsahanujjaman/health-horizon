import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, User, FilePlus, LogOut, Stethoscope, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    experienceYears: '',
    hospitalName: '',
    bio: '',
    consultationFee: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/doctors/me');
        const data = response.data || {};
        setFormData({
          specialization: data.specialization || '',
          experienceYears: data.experienceYears || '',
          hospitalName: data.hospitalName || '',
          bio: data.bio || '',
          consultationFee: data.consultationFee || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/doctors', formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
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
            to="/doctor/profile"
            className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 rounded-xl font-medium"
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
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Professional Profile</h2>
            <p className="text-gray-500">Update your credentials and practice details.</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Cardiology"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee
                  </label>
                  <input
                    type="text"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="$150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                  placeholder="City General Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                  placeholder="Brief professional biography..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
