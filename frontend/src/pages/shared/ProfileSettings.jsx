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
        let endpoint = '/profile/me';
        if (isDoctor) endpoint = '/doctors/me';
        else if (isPatient) endpoint = '/patients/me';
        
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
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {isPatient ? (
        <PatientSidebar />
      ) : (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
          <button
            onClick={() => navigate(isDoctor ? '/doctor/dashboard' : -1)}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profile Tips</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Keeping your professional details up to date helps patients find and trust your practice.
              </p>
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="mb-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your profile information and preferences.</p>
          </header>

          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6 relative z-10 bg-white/50 backdrop-blur-xl">
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-3xl p-[3px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md flex items-center justify-center relative">
                  <div className="w-full h-full rounded-[1.3rem] bg-white overflow-hidden flex items-center justify-center relative">
                    {profile.profilePictureUrl ? (
                      <img
                        src={getImageUrl(profile.profilePictureUrl)}
                        alt="Profile"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                  >
                    <Camera className="w-4 h-4" />
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
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{profile.fullName || 'No Name'}</h3>
                  {(profile.dateOfBirth || profile.age || profile.gender) && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {(profile.dateOfBirth || profile.age) && (
                         <span>{calculateAge(profile.dateOfBirth)} YRS</span>
                      )}
                      {(profile.dateOfBirth || profile.age) && profile.gender && <span className="text-slate-300">•</span>}
                      {profile.gender && <span className="text-pink-500">{profile.gender}</span>}
                    </div>
                  )}
                </div>
                <p className="text-slate-500 font-bold text-sm mt-0.5 mb-4">{profile.email}</p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center">
                    {role}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 md:px-8 space-y-5 bg-white relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-700"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Gender
                  </label>
                  <div className="relative group/input">
                    <select
                      value={profile.gender || ''}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 group-focus-within/input:border-indigo-500 transition-all">
                      <select
                        className="w-full pl-2 pr-6 py-2.5 bg-transparent outline-none font-semibold text-sm text-slate-700 appearance-none cursor-pointer"
                        onChange={(e) => {
                          const code = e.target.value;
                          const current = profile.phoneNumber || '';
                          const parts = current.split(' ');
                          const numberOnly = parts.length > 1 ? parts[1] : parts[0];
                          setProfile({ ...profile, phoneNumber: `${code} ${numberOnly}` });
                        }}
                        value={profile.phoneNumber?.split(' ')[0] || '+91'}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+880">+880</option>
                        <option value="+971">+971</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative flex-1 group/input">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                      <input
                        type="tel"
                        value={profile.phoneNumber?.split(' ')[1] || profile.phoneNumber || ''}
                        onChange={(e) => {
                          const code = profile.phoneNumber?.split(' ')[0] || '+91';
                          setProfile({ ...profile, phoneNumber: `${code} ${e.target.value}` });
                        }}
                        placeholder="Mobile number"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Date of Birth & Age Indicator */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Date of Birth
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1 group/input">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                      <input
                        type="date"
                        value={profile.dateOfBirth || ''}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-700"
                      />
                    </div>
                    <div className="h-[42px] px-3 bg-indigo-500 rounded-xl flex items-center justify-center gap-1 min-w-[4rem] shadow-md shadow-indigo-500/20">
                      <span className="text-sm font-black text-white tracking-tight">
                        {calculateAge(profile.dateOfBirth) || '--'}
                      </span>
                      <span className="text-[9px] font-bold text-indigo-100 mt-0.5 uppercase">Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Home Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Home Address
                  </label>
                  <div className="relative group/input">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      placeholder="City, Country"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-700"
                    />
                  </div>
                </div>

                {isDoctor && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Specialization
                      </label>
                      <div className="relative group/input">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          value={profile.specialization || ''}
                          onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold text-sm text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Experience (Years)
                      </label>
                      <div className="relative group/input">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                        <input
                          type="number"
                          value={profile.experienceYears || ''}
                          onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold text-sm text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Consultation Fee
                      </label>
                      <div className="relative group/input">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">$</div>
                        <input
                          type="text"
                          value={profile.consultationFee || ''}
                          onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold text-sm text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Hospital / Clinic
                      </label>
                      <div className="relative group/input">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          value={profile.hospitalName || ''}
                          onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold text-sm text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Professional Bio
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows="2"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold text-sm text-slate-700 resize-none"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
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
