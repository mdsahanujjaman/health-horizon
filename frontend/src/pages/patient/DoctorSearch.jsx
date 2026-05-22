import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
import { playTapSound } from '../../utils/audio';

const DoctorSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    specialization: location.state?.specialization || '',
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
    const spec = location.state?.specialization || '';
    if (spec) {
      fetchDoctors({
        name: '',
        specialization: spec,
        hospitalName: '',
        minExperience: '',
      });
    } else {
      fetchDoctors();
    }
  }, [location.state]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(searchCriteria);
  };


  const getSpecialtyStyles = (spec = '') => {
    const s = spec.toLowerCase();
    if (s.includes('cardio')) return 'bg-rose-50 text-rose-600 border-rose-100';
    if (s.includes('pedi')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s.includes('neuro')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (s.includes('psych')) return 'bg-violet-50 text-violet-600 border-violet-100';
    if (s.includes('ortho')) return 'bg-sky-50 text-sky-600 border-sky-100';
    if (s.includes('derm')) return 'bg-teal-50 text-teal-600 border-teal-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <PatientSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Find a Specialist</h2>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                Search for the best clinical doctors across different specializations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </div>

          {/* Search Bar & Filters Console */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/50 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            {/* Ambient Background Orb */}
            <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/8 transition-colors duration-500"></div>
            
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Doctor Name..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                  value={searchCriteria.name}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Specialization..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                  value={searchCriteria.specialization}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, specialization: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Hospital location..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                  value={searchCriteria.hospitalName}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, hospitalName: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                onClick={playTapSound}
                className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary shadow-xl shadow-slate-900/10 hover:shadow-primary/30 transition-all active:scale-[0.98] duration-300 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find Doctors
              </button>
            </form>
          </div>

          {/* Results Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
              <p className="mt-4 text-slate-500 font-bold text-sm tracking-wide uppercase">Searching Specialities...</p>
            </div>
          ) : (
            <>
              {doctors.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center shadow-sm max-w-2xl mx-auto">
                  <div className="bg-slate-50 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <SearchX className="w-10 h-10 text-slate-350" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No Doctors Found</h3>
                  <p className="text-slate-500 font-medium text-sm">We couldn't find any match for your criteria.</p>
                  <button
                    onClick={() => {
                      playTapSound();
                      setSearchCriteria({
                        name: '',
                        specialization: '',
                        hospitalName: '',
                        minExperience: '',
                      });
                      fetchDoctors();
                    }}
                    className="mt-6 bg-slate-50 border border-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors text-xs uppercase tracking-wider"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => {
                    const specialtyClass = getSpecialtyStyles(doctor.specialization);
                    return (
                      <div
                        key={doctor.id}
                        className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-2 group flex flex-col justify-between min-h-[440px]"
                      >
                        <div>
                          {/* Top row: Avatar & Specialization Capsule */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-sky-100 text-primary rounded-3xl flex items-center justify-center font-black text-xl overflow-hidden border-2 border-white shadow-md shadow-indigo-100/30 group-hover:scale-105 transition-transform duration-300">
                                {doctor.profilePictureUrl ? (
                                  <img
                                    src={getImageUrl(doctor.profilePictureUrl)}
                                    alt={doctor.fullName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <span className="bg-gradient-to-br from-primary to-indigo-600 bg-clip-text text-transparent">
                                    {doctor.fullName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </span>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-md shadow-emerald-500/30"></div>
                            </div>
                            
                            <div className="text-right">
                              <span className={`text-[10px] font-black border uppercase tracking-wider px-3 py-1 rounded-full ${specialtyClass}`}>
                                {doctor.specialization}
                              </span>
                              
                              {/* Clinical Star Rating Rating */}
                              <div className="flex items-center justify-end gap-1 mt-3">
                                <span className="text-amber-500 text-xs">★</span>
                                <span className="text-slate-800 font-extrabold text-xs">4.9</span>
                                <span className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider">(148 reviews)</span>
                              </div>
                            </div>
                          </div>

                          {/* Middle Content */}
                          <div className="mt-6 space-y-2.5">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                              Dr. {doctor.fullName}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{doctor.hospitalName || 'HealthHorizon Care Center'}</span>
                            </div>

                            {/* Clinically premium next slot availability ticket */}
                            <div className="bg-emerald-50/50 border border-emerald-100/30 text-emerald-700 px-3 py-2 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 mt-4">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              <span>⚡ Next Slot: Today, 03:00 PM</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Info & Button */}
                        <div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-6">
                            <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Consultation</span>
                              <span className="text-lg font-black text-slate-900 leading-none">
                                {doctor.consultationFee ? `₹${doctor.consultationFee}` : '₹120'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Experience</span>
                              <span className="text-xs font-black text-slate-800 leading-none">{doctor.experienceYears || '8'} Years</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              playTapSound();
                              navigate('/patient/book-appointment', {
                                state: { doctorId: doctor.id, doctorName: doctor.fullName },
                              });
                            }}
                            className="w-full mt-6 bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary shadow-lg shadow-slate-900/10 hover:shadow-primary/30 transition-all active:scale-[0.98] duration-300"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
