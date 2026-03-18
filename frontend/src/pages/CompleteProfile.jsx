import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Users,
  Target,
  Loader2,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'PATIENT';
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    beneficiaryName: '', // For Caregivers
    age: '',
    gender: '',
    healthGoal: '',
    bio: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Doctors skip health goals
    if (role === 'DOCTOR') {
      handleSubmit();
      return;
    }

    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
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
          // Redirect Caregivers to Patient Dashboard (context handled by backend/localStorage)
          navigate('/patient/dashboard');
          break;
        case 'PATIENT':
        default:
          navigate('/patient/dashboard');
          break;
      }
    }, 1500);
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
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-800"
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
                      className="w-full pl-14 pr-6 py-5 bg-white/50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-800"
                      placeholder="E.g. Alexander Pierce"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest">
                      Age
                    </label>
                    <div className="relative group/input">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <input
                        name="age"
                        type="number"
                        required
                        className="w-full pl-14 pr-6 py-5 bg-white/50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-800"
                        placeholder="24"
                        value={formData.age}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-3 uppercase tracking-widest">
                      Gender
                    </label>
                    <div className="relative group/input">
                      <Users className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                      <select
                        name="gender"
                        className="w-full pl-14 pr-6 py-5 bg-white/50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus-aura outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
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
                (step === 2 && !formData.healthGoal)
              }
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>
                    {step === 1 ? 'Continue' : 'Complete Registration'}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
