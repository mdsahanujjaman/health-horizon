import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FilePlus,
  LogOut,
  Stethoscope,
  Save,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';
import NavProfile from '../../components/NavProfile';

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
            { icon: User, label: 'My Profile', path: '/doctor/profile', active: true },
            { icon: FilePlus, label: 'Issue Prescription', path: '/doctor/issue-prescription' },
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
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Professional Profile</h2>
            <p className="text-slate-500 font-medium mt-1">
              Update your clinical credentials, specialization, and practice details.
            </p>
          </div>

          <div className="rounded-[3rem] border border-sky-100/80 p-10 bg-gradient-to-br from-white via-sky-50/20 to-indigo-50/10 shadow-xl shadow-slate-200/50">
            {message.text && (
              <div
                className={`mb-8 p-5 rounded-2xl font-bold text-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Medical Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-sky-50/30 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Cardiology"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-sky-50/30 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Consultation Fee
                  </label>
                  <input
                    type="text"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-sky-50/30 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                    placeholder="e.g. $150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-sky-50/30 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                  placeholder="City General Hospital"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-6 py-4 bg-sky-50/30 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                  placeholder="Write a brief professional biography outlining clinical interests, certifications, etc..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
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
