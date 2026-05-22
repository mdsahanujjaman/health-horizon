import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, User, FileText, LogOut, Activity, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';
import PatientSidebar from '../../components/PatientSidebar';

const PatientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    height: '',
    weight: '',
    medicalConditions: '',
    calmMode: false,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/patients/me');
        // Populate form with existing data
        // Handle nulls by defaulting to empty strings
        const data = response.data || {};
        setFormData({
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || 'MALE',
          bloodGroup: data.bloodGroup || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          height: data.height || '',
          weight: data.weight || '',
          medicalConditions: data.medicalConditions || '',
          calmMode: data.calmMode || false,
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
        // If it's a 404, it might mean profile doesn't exist yet, which is fine (create mode)
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const cleanedData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth || null,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
    };

    try {
      await api.post('/patients', cleanedData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      const response = await api.get('/patients/me');
      const data = response.data || {};
      setFormData({
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || 'MALE',
        bloodGroup: data.bloodGroup || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
        height: data.height || '',
        weight: data.weight || '',
        medicalConditions: data.medicalConditions || '',
        calmMode: data.calmMode || false,
      });
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
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
      <PatientSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-gray-500">Update your personal information and health metrics.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="175.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="70.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="O+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Conditions (Comma separated)
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    rows="2"
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Hypertension, Diabetes, Asthma"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="123 Wellness Blvd..."
                  ></textarea>
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="calmMode"
                    name="calmMode"
                    checked={formData.calmMode}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="calmMode" className="text-sm text-gray-700">
                    Enable Calm Mode (Reduces animations and uses softer colors)
                  </label>
                </div>
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

export default PatientProfile;
