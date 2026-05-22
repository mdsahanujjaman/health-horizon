import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Activity,
  User,
  Calendar,
  Users,
  Target,
  Loader2,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import api from '../services/api';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'PATIENT';
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [credentialFile, setCredentialFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    beneficiaryName: '', // For Caregivers
    age: '',
    gender: '',
    height: '',
    weight: '',
    healthGoal: '',
    experienceYears: '',
    consultationFee: '',
    bio: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Doctors go to step 2 for stats
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = role === 'DOCTOR' ? '/doctors' : '/patients';
      console.log(`Submitting profile to ${endpoint} with role ${role}`);
      const res = await api.post(endpoint, {
        ...formData,
        dateOfBirth: formData.age ? new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(formData.age))).toISOString().split('T')[0] : null,
        medicalConditions: formData.healthGoal || '',
      });
      console.log('Profile update response:', res.status, res.data);

      if (role === 'DOCTOR' && credentialFile) {
        const fileData = new FormData();
        fileData.append('file', credentialFile);
        try {
          await api.post('/doctors/upload-credential', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('Credential uploaded successfully');
        } catch (err) {
          console.error('Failed to upload credential', err);
        }
      }

      switch (role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard');
          break;
        case 'LAB_TECHNICIAN':
          navigate('/lab/dashboard');
          break;
        case 'COUNSELOR':
          navigate('/counselor/dashboard');
          break;
        case 'RECORD_HANDLER':
          navigate('/handler/dashboard');
          break;
        case 'CAREGIVER':
          navigate('/patient/dashboard');
          break;
        case 'PATIENT':
        default:
          navigate('/patient/dashboard');
          break;
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background Assets */}
      <div className="absolute inset-0 z-0 opacity-[0.05]">
        <img
          src="/src/artifacts/wellness_abstract_art_1771265227239.png"
          className="w-full h-full object-cover scale-110 animate-pulse-slow"
          alt=""
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-soft opacity-30"></div>

      <div className="max-w-xl w-full relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-slate-200'}`}
              ></div>
            ))}
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Finalizing Your Identity
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Just a few clinical details to personalize your experience.
          </p>
        </div>

        <div className="glass-card p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group hover-lift">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="space-y-8 relative z-10">
            {step === 1 ? (
              <div className="space-y-6 animate-fade-in-up">
                {/* Caregiver Specific Field */}
                {role === 'CAREGIVER' && (
                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <HeartHandshake className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                          Caregiver Setup
                        </h3>
                        <p className="text-xs text-slate-500 font-bold">
                          Creating a managed account
                        </p>
                      </div>
                    </div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest">
                      Patient's Full Name
                    </label>
                    <div className="relative group/input">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <input
                        name="beneficiaryName"
                        type="text"
                        required
                        className="input-premium pl-14 bg-white/50"
                        placeholder="E.g. Sarah Smith (My Mother)"
                        value={formData.beneficiaryName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest">
                    {role === 'CAREGIVER' ? 'Your Name (Guardian)' : 'Full Legal Name'}
                  </label>
                  <div className="relative group/input">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                    <input
                      name="fullName"
                      type="text"
                      required
                      className="input-premium pl-14 bg-white/50"
                      placeholder="E.g. Alexander Pierce"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest text-xs">
                      Age
                    </label>
                    <div className="relative group/input">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <input
                        name="age"
                        type="number"
                        required
                        className="input-premium pl-14 bg-white/50"
                        placeholder="24"
                        value={formData.age}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest text-xs">
                      Gender
                    </label>
                    <div className="relative group/input">
                      <Users className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <select
                        name="gender"
                        className="input-premium pl-14 bg-white/50 appearance-none cursor-pointer"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest text-xs">
                      Height (cm)
                    </label>
                    <div className="relative group/input">
                      <Activity className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <input
                        name="height"
                        type="number"
                        className="input-premium pl-14 bg-white/50"
                        placeholder="175"
                        value={formData.height}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest text-xs">
                      Weight (kg)
                    </label>
                    <div className="relative group/input">
                      <Activity className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <input
                        name="weight"
                        type="number"
                        className="input-premium pl-14 bg-white/50"
                        placeholder="70"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : role === 'DOCTOR' ? (
              <div className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest text-xs">
                      Years Experience
                    </label>
                    <div className="relative group/input">
                      <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <input
                        name="experienceYears"
                        type="number"
                        className="input-premium pl-14 bg-white/50"
                        placeholder="5"
                        value={formData.experienceYears}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest text-xs">
                      Fee ($)
                    </label>
                    <div className="relative group/input">
                      <Activity className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <input
                        name="consultationFee"
                        type="number"
                        className="input-premium pl-14 bg-white/50"
                        placeholder="50"
                        value={formData.consultationFee}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest text-xs">
                    Short Bio
                  </label>
                  <textarea
                    name="bio"
                    className="input-premium bg-white/50 h-28"
                    placeholder="Tell us about your medical background..."
                    value={formData.bio}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                  <label className="block text-sm font-black text-primary ml-1 mb-2 uppercase tracking-widest text-xs">
                    Upload Medical License (Required)
                  </label>
                  <p className="text-xs text-slate-500 font-bold mb-4 ml-1">
                    Please provide your medical degree or practice certificate for governance review.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setCredentialFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-primary file:text-white hover:file:bg-sky-600 transition-all cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest">
                    Primary Health Goal
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      'Better Sleep',
                      'Fitness & Strength',
                      'Mental Clarity',
                      'Disease Prevention',
                    ].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setFormData({ ...formData, healthGoal: goal })}
                        className={`p-5 rounded-[2rem] border-2 transition-all font-bold text-left flex items-center justify-between group ${formData.healthGoal === goal ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/50 border-slate-100 text-slate-700 hover:border-primary/50'}`}
                      >
                        <span>{goal}</span>
                        {formData.healthGoal === goal ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Target className="w-6 h-6 text-slate-300 group-hover:text-primary/50" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

              <button
                onClick={handleNext}
                disabled={
                  loading ||
                  (step === 1 &&
                    (!formData.fullName ||
                      !formData.age ||
                      !formData.gender ||
                      (role === 'CAREGIVER' && !formData.beneficiaryName))) ||
                  (step === 2 && role !== 'DOCTOR' && !formData.healthGoal) ||
                  (step === 2 && role === 'DOCTOR' && (!formData.experienceYears || !formData.consultationFee || !formData.bio))
                }
                className="btn-premium w-full py-5 text-lg mt-8"
              >
                <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center gap-3">
                  {loading ? (
                    <Loader2 className="animate-spin h-6 w-6" />
                  ) : (
                    <>
                      {step === 1 ? 'Continue' : 'Complete Registration'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
          </div>
        </div>

        <p className="text-center mt-12 text-slate-400 font-bold text-sm uppercase tracking-widest">
          Secure Clinical Verification Pipeline
        </p>
      </div>
    </div>
  );
};

export default CompleteProfile;
