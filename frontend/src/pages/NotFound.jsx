import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Assets */}
      <div className="absolute inset-0 z-0 opacity-10 blur-3xl">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full animate-pulse-slow transition-delay-1000"></div>
      </div>

      {/* Floating Icons Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]">
        <img
          src="/src/artifacts/medical_hero_bg_1771265227239.png"
          className="w-full h-full object-cover grayscale"
          alt=""
        />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10 animate-fade-in-up">
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl relative border border-white/50 group hover-lift">
            <Compass className="w-24 h-24 text-primary group-hover:rotate-180 transition-transform duration-1000" />
          </div>
        </div>

        <h1 className="text-8xl font-black text-slate-900 tracking-tighter mb-4 italic">404</h1>
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-6">Lost in Horizon</h2>
        <p className="text-slate-500 font-bold text-lg mb-12 max-w-md mx-auto leading-relaxed uppercase tracking-widest">
          The clinical resource you are looking for has been moved or purged from our registry.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:border-primary/50 transition-all hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
            Back to Origin
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 transition-all hover:-translate-y-1 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Central Command
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 text-center w-full left-0">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
          Protocol Error: RESOURCE_NOT_FOUND_IN_HORIZON
        </p>
      </div>
    </div>
  );
};

export default NotFound;
