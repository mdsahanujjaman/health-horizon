import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Mail, Save, Loader2, ArrowLeft, CheckCircle2, Phone, Calendar, MapPin, ChevronDown, Briefcase, Activity } from 'lucide-react';
import api, { getImageUrl } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import PatientSidebar from '../../components/PatientSidebar';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    profilePictureUrl: '',
    phoneNumber: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    address: '',
    createdAt: '',
    // Doctor specific
    specialization: '',
    experienceYears: '',
    hospitalName: '',
    bio: '',
    consultationFee: '',
  });

  const role = localStorage.getItem('role');
  const isDoctor = role === 'DOCTOR';
  const isPatient = role === 'PATIENT' || role === 'CAREGIVER';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = isDoctor ? '/doctors/me' : '/profile/me';
        const res = await api.get(endpoint);
        setProfile((prev) => ({
          ...prev,
          ...res.data,
          fullName: res.data.fullName || res.data.user?.fullName || prev.fullName,
          email: res.data.email || res.data.user?.email || prev.email,
        }));
      } catch (err) {
        console.error('Failed to load profile data', err);
        addToast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [addToast, isDoctor]);

  const calculateAge = (dob) => {
    if (!dob) return profile.age || null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (isDoctor) {
        res = await api.post('/doctors', {
          fullName: profile.fullName,
          specialization: profile.specialization,
          experienceYears: profile.experienceYears,
          hospitalName: profile.hospitalName,
          bio: profile.bio,
          consultationFee: profile.consultationFee,
          phoneNumber: profile.phoneNumber,
        });
      } else {
        res = await api.post('/patients', {
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
          address: profile.address
        });
      }

      const updatedData = res.data;
      setProfile((prev) => ({
        ...prev,
        ...updatedData,
        fullName: updatedData.fullName || updatedData.user?.fullName || prev.fullName,
        email: updatedData.email || updatedData.user?.email || prev.email,
      }));

      localStorage.setItem('fullName', updatedData.fullName || profile.fullName);
      addToast('Profile updated successfully', 'success');

      if (updatedData.profilePictureUrl) {
        localStorage.setItem('profilePictureUrl', updatedData.profilePictureUrl);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile({ ...profile, profilePictureUrl: res.data.url });
      localStorage.setItem('profilePictureUrl', res.data.url);
      addToast('Profile picture updated', 'success');
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed to upload image', err);
      addToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
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
      {isPatient ? (
        <PatientSidebar />
      ) : (
        <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-8 hidden md:flex">
          <button
            onClick={() => navigate(isDoctor ? '/doctor/dashboard' : -1)}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Profile Tips</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Keeping your professional details up to date helps patients find and trust your practice.
              </p>
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-medium mt-2">
              Manage your profile information and preferences.
            </p>
          </header>

          <section className="gradient-border-rich overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] p-1 bg-gradient-to-tr from-cyan-500 via-violet-500 to-rose-500 shadow-xl flex items-center justify-center relative">
                  <div className="w-full h-full rounded-[2.3rem] bg-white overflow-hidden flex items-center justify-center relative">
                    {profile.profilePictureUrl ? (
                      <img
                        src={getImageUrl(profile.profilePictureUrl)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-slate-300" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-sm z-10 overflow-visible"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{profile.fullName}</h3>
                  {(profile.dateOfBirth || profile.age || profile.gender) && (
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                      {(profile.dateOfBirth || profile.age) && (
                        <span>{calculateAge(profile.dateOfBirth)} Years</span>
                      )}
                      {(profile.dateOfBirth || profile.age) && profile.gender && <span className="text-slate-200">•</span>}
                      {profile.gender && <span>{profile.gender}</span>}
                    </div>
                  )}
                </div>
                <p className="text-slate-500 font-bold text-xl mt-1 mb-8">{profile.email}</p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-6 py-2.5 bg-sky-50 text-sky-500 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center border border-sky-100/50">
                    {role}
                  </span>
                  <span className="px-6 py-2.5 bg-emerald-50 text-emerald-500 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-emerald-100/50 active-aura">
                    <CheckCircle2 className="w-4 h-4" /> ACTIVE
                  </span>
                  {profile.createdAt && (
                    <span className="px-6 py-2.5 bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-slate-100/50">
                      <Calendar className="w-4 h-4" /> MEMBER SINCE {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-12 md:p-16 space-y-12 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Full Name */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Full Name
                  </label>
                  <div className="relative group/input">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full pl-16 pr-6 py-5 bg-slate-100/50 border border-slate-100 rounded-[2rem] font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Gender
                  </label>
                  <div className="relative group/input">
                    <select
                      value={profile.gender || ''}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-4">
                    <div className="relative w-32 overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 group-focus-within/input:border-primary transition-all">
                      <select
                        className="w-full px-6 py-5 bg-transparent outline-none font-bold text-slate-700 appearance-none cursor-pointer text-sm"
                        onChange={(e) => {
                          const code = e.target.value;
                          const current = profile.phoneNumber || '';
                          const parts = current.split(' ');
                          const numberOnly = parts.length > 1 ? parts[1] : parts[0];
                          setProfile({ ...profile, phoneNumber: `${code} ${numberOnly}` });
                        }}
                        value={profile.phoneNumber?.split(' ')[0] || '+91'}
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+880">+880 (BD)</option>
                        <option value="+971">+971 (AE)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative flex-1 group/input">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
                      <input
                        type="tel"
                        value={profile.phoneNumber?.split(' ')[1] || profile.phoneNumber || ''}
                        onChange={(e) => {
                          const code = profile.phoneNumber?.split(' ')[0] || '+91';
                          setProfile({ ...profile, phoneNumber: `${code} ${e.target.value}` });
                        }}
                        placeholder="Mobile number"
                        className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Date of Birth & Age Indicator */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Date of Birth
                  </label>
                  <div className="flex gap-5 items-center">
                    <div className="relative flex-1 group/input">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
                      <input
                        type="date"
                        value={profile.dateOfBirth || ''}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div className="h-16 px-6 bg-sky-50/50 border border-sky-100 rounded-3xl flex items-center gap-1.5">
                      <span className="text-2xl font-black text-sky-500 tracking-tight">
                        {calculateAge(profile.dateOfBirth) || '--'}
                      </span>
                      <span className="text-[13px] font-bold text-sky-400 mt-0.5">yr</span>
                    </div>
                  </div>
                </div>

                {/* Home Address */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Home Address
                  </label>
                  <div className="relative group/input">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
                    <input
                      type="text"
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      placeholder="Street, City, Country"
                      className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {isDoctor && (
                  <>
                    {/* Specialization */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                        Specialization
                      </label>
                      <div className="relative group/input">
                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
                        <input
                          type="text"
                          value={profile.specialization || ''}
                          onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                          placeholder="e.g. Cardiology"
                          className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                        Experience (Years)
                      </label>
                      <div className="relative group/input">
                        <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
                        <input
                          type="number"
                          value={profile.experienceYears || ''}
                          onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                          placeholder="10"
                          className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Consultation Fee */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                        Consultation Fee
                      </label>
                      <div className="relative group/input">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">$</div>
                        <input
                          type="text"
                          value={profile.consultationFee || ''}
                          onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                          placeholder="150"
                          className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Hospital Name */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                        Hospital / Clinic Name
                      </label>
                      <div className="relative group/input">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
                        <input
                          type="text"
                          value={profile.hospitalName || ''}
                          onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })}
                          placeholder="City General Hospital"
                          className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Professional Bio */}
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                        Professional Bio
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows="4"
                        placeholder="Brief professional biography..."
                        className="w-full px-8 py-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-700 resize-none placeholder:text-slate-300"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl shadow-slate-900/30 hover:shadow-slate-900/50 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-4"
                >
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Save className="w-6 h-6" />
                  )}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;
