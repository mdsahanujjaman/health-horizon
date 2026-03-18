import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Activity,
  LayoutDashboard,
  User,
  Calendar,
  LogOut,
  Stethoscope,
  MapPin,
  Briefcase,
  Award,
  Loader2,
  SearchX,
} from 'lucide-react';
import api, { getImageUrl } from '../../services/api';
import PatientSidebar from '../../components/PatientSidebar';
import NotificationBell from '../../components/NotificationBell';

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    specialization: '',
    hospitalName: '',
    minExperience: '',
  });

  const fetchDoctors = async (criteria = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (criteria.name) params.append('name', criteria.name);
      if (criteria.specialization) params.append('specialization', criteria.specialization);
      if (criteria.hospitalName) params.append('hospitalName', criteria.hospitalName);
      if (criteria.minExperience) params.append('minExperience', criteria.minExperience);

      const res = await api.get(`/doctors/search?${params.toString()}`);
      setDoctors(res.data);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(searchCriteria);
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Find a Specialist</h2>
              <p className="text-gray-500">
                Search for the best doctors across different specializations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Doctor Name"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  value={searchCriteria.name}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Specialization"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  value={searchCriteria.specialization}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, specialization: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hospital"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  value={searchCriteria.hospitalName}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, hospitalName: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white py-2 px-6 rounded-xl font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-primary/25"
              >
                Search
              </button>
            </form>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="mt-4 text-gray-500 font-medium">Finding specialists...</p>
            </div>
          ) : (
            <>
              {doctors.length === 0 ? (
                <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="bg-gray-50 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <SearchX className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Doctors Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                  <button
                    onClick={() => {
                      setSearchCriteria({
                        name: '',
                        specialization: '',
                        hospitalName: '',
                        minExperience: '',
                      });
                      fetchDoctors();
                    }}
                    className="mt-6 text-primary font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                            {doctor.profilePictureUrl ? (
                              <img
                                src={getImageUrl(doctor.profilePictureUrl)}
                                alt={doctor.fullName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              doctor.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                              Dr. {doctor.fullName}
                            </h3>
                            <p className="text-sm border border-primary/20 text-primary px-2 py-0.5 rounded-full inline-block bg-primary/5 font-medium mt-1">
                              {doctor.specialization}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-3">
                          <div className="flex items-center gap-3 text-gray-600 text-sm">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span>{doctor.experienceYears} Years Experience</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{doctor.hospitalName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600 text-sm">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span>Consultation Fee: {doctor.consultationFee}</span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate('/patient/book-appointment', {
                              state: { doctorId: doctor.id, doctorName: doctor.fullName },
                            })
                          }
                          className="w-full mt-8 bg-gray-50 text-gray-900 py-3 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 border border-gray-100 active:bg-sky-700"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorSearch;
