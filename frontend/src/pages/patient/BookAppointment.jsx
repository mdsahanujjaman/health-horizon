import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, Stethoscope, MapPin, Award, User, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import PatientSidebar from '../../components/PatientSidebar';
import { playAppointmentConfirmedSound, playTapSound } from '../../utils/audio';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingDoctor, setFetchingDoctor] = useState(false);
  const [fetchingAllDoctors, setFetchingAllDoctors] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  
  // Custom split date & time states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentTime: '',
    reason: '',
  });
  const [message, setMessage] = useState('');

  const location = useLocation();
  const { doctorId, doctorName } = location.state || {};

  useEffect(() => {
    fetchAllDoctors();
    if (doctorId) {
      setFormData((prev) => ({ ...prev, doctorId }));
      fetchDoctorDetails(doctorId);
    }
  }, [doctorId]);

  // Sync date + time slot directly into backend's appointmentTime payload
  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      setFormData((prev) => ({
        ...prev,
        appointmentTime: `${selectedDate}T${selectedTimeSlot}:00`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        appointmentTime: '',
      }));
    }
  }, [selectedDate, selectedTimeSlot]);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAllDoctors = async () => {
    setFetchingAllDoctors(true);
    try {
      const res = await api.get('/doctors');
      setAllDoctors(res.data);
    } catch (err) {
      console.error('Failed to fetch all doctors', err);
    } finally {
      setFetchingAllDoctors(false);
    }
  };

  const fetchDoctorDetails = async (id) => {
    if (!id) return;
    setFetchingDoctor(true);
    try {
      const res = await api.get(`/doctors/${id}`);
      setDoctorInfo(res.data);
    } catch (err) {
      console.error('Failed to fetch doctor details', err);
      if (doctorName && !doctorInfo) {
        setDoctorInfo({ fullName: doctorName });
      }
    } finally {
      setFetchingDoctor(false);
    }
  };

  const handleDoctorSelect = (e) => {
    const id = e.target.value;
    setFormData({ ...formData, doctorId: id });
    if (id) {
      fetchDoctorDetails(id);
    } else {
      setDoctorInfo(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.appointmentTime) {
      setMessage('⚠️ Please select a date and a time slot.');
      setLoading(false);
      return;
    }

    const selectedTime = new Date(formData.appointmentTime);
    if (selectedTime < new Date()) {
      setMessage('⚠️ Cannot select a past date or time for the appointment.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/appointments', {
        doctorId: formData.doctorId,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
      });

      const selectedDoctorName = doctorInfo?.fullName || 'Selected Doctor';
      const consultationFee = doctorInfo?.consultationFee || '$50.00';

      setMessage('Appointment booked! Redirecting to payment...');
      playAppointmentConfirmedSound();
      setTimeout(() => {
        navigate('/patient/payment', {
          state: {
            appointmentId: res.data.id,
            amount: consultationFee,
            doctorName: selectedDoctorName,
          },
        });
      }, 1000);
    } catch (err) {
      console.error('Booking failed', err);
      setMessage('Failed to book appointment. Check ID or time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Book an Appointment</h2>
            <p className="text-slate-500 font-medium">Schedule a session with your preferred healthcare specialist.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Doctor Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden sticky top-8">
                <div className="h-24 bg-gradient-to-br from-primary/20 to-sky-100"></div>
                <div className="px-6 pb-8 -mt-12 text-center">
                  <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative">
                    {fetchingDoctor ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : doctorInfo?.profilePictureUrl ? (
                      <img
                        src={`http://localhost:8081${doctorInfo.profilePictureUrl}`}
                        alt={doctorInfo.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">' + (doctorInfo?.fullName?.[0] || 'D') + '</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      {doctorInfo ? `Dr. ${doctorInfo.fullName}` : 'Select a Doctor'}
                    </h3>
                    {doctorInfo?.specialization && (
                      <p className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-full inline-block mt-1">
                        {doctorInfo.specialization}
                      </p>
                    )}
                  </div>

                  {doctorInfo && (
                    <div className="mt-6 space-y-3 text-left">
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span>{doctorInfo.experienceYears || '--'} Years Exp.</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{doctorInfo.hospitalName || 'Health Center'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <Stethoscope className="w-4 h-4 text-slate-400" />
                        <span>Fee: {doctorInfo.consultationFee || '$50.00'}</span>
                      </div>
                    </div>
                  )}

                  {!doctorInfo && !fetchingDoctor && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium italic">
                        Select a doctor from the specialist search or enter a Doctor ID.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
                {message && (
                  <div
                    className={`mb-8 p-5 rounded-2xl flex items-center gap-3 font-bold animate-fade-in ${message.includes('success') || message.includes('booked') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
                  >
                    {message.includes('booked') ? <CheckCircle className="w-5 h-5" /> : null}
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        Select Doctor
                      </label>
                      <div className="relative group">
                        <select
                          name="doctorId"
                          value={formData.doctorId}
                          onChange={handleDoctorSelect}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700 appearance-none"
                        >
                          <option value="">Choose a Specialist</option>
                          {fetchingAllDoctors ? (
                            <option disabled>Loading doctors...</option>
                          ) : (
                            allDoctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                Dr. {doc.fullName} ({doc.specialization})
                              </option>
                            ))
                          )}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Stethoscope className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Select Date
                      </label>
                      <input
                        type="date"
                        min={getTodayDateString()}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTimeSlot(''); // reset slot when date changes
                        }}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Interactive Time Slots Grid */}
                  {selectedDate && (
                    <div className="space-y-3 animate-fade-in">
                      <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Select Time Slot
                      </label>
                      
                      <div className="space-y-4">
                        {/* Morning Slots */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Morning Sessions</p>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: '09:00 AM', value: '09:00' },
                              { label: '10:00 AM', value: '10:00' },
                              { label: '11:00 AM', value: '11:00' }
                            ].map((slot) => {
                              const active = selectedTimeSlot === slot.value;
                              return (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => setSelectedTimeSlot(slot.value)}
                                  className={`py-3.5 px-4 rounded-2xl font-bold text-xs transition-all duration-300 hover-lift ${active ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-100/50'}`}
                                >
                                  {slot.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Afternoon Slots */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Afternoon Sessions</p>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { label: '02:00 PM', value: '14:00' },
                              { label: '03:00 PM', value: '15:00' },
                              { label: '04:00 PM', value: '16:00' },
                              { label: '05:00 PM', value: '17:00' }
                            ].map((slot) => {
                              const active = selectedTimeSlot === slot.value;
                              return (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => setSelectedTimeSlot(slot.value)}
                                  className={`py-3.5 px-3 rounded-2xl font-bold text-[11px] transition-all duration-300 hover-lift ${active ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-100/50'}`}
                                >
                                  {slot.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      Reason for Visit
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="Briefly describe your symptoms or reason for the visit..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-slate-400 max-w-[250px] font-medium leading-relaxed">
                      By confirming, you agree to the consultation terms and immediate payment processing.
                    </p>
                    <button
                      type="submit"
                      disabled={loading || !doctorInfo}
                      className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-900/10 hover:shadow-slate-900/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookAppointment;
