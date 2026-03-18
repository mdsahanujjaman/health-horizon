import { useState } from 'react';
import { Stethoscope } from 'lucide-react';

const Particle = () => {
  const styles = useState(() => ({
    width: `${Math.random() * 200 + 50}px`,
    height: `${Math.random() * 200 + 50}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${Math.random() * 20 + 20}s`,
  }))[0];

  return (
    <div
      className="absolute rounded-full bg-primary/20 blur-xl animate-float"
      style={styles}
    ></div>
  );
};

const LandingPage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 bg-white"
      onMouseMove={handleMouseMove}
    >
      {/* Hero Background with Parallax */}
      <div
        className="absolute inset-0 z-0 overflow-hidden transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)` }}
      >
        <img
          src="/src/artifacts/medical_hero_bg_1771265227239.png"
          className="w-full h-full object-cover opacity-10 scale-110 object-center"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(12)].map((_, i) => (
          <Particle key={i} />
        ))}
      </div>

      <div
        className="relative z-10 w-full max-w-4xl text-center animate-fade-in-up transition-transform duration-500 ease-out"
        style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
      >
        <div className="flex justify-center mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:blur-[60px] transition-all duration-700"></div>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-2xl relative border border-white hover-lift ring-1 ring-slate-100">
              <Stethoscope className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-7xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter">
          Health<span className="text-primary tracking-tighter">Horizon</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-[0.2em]">
          The Next Generation Clinical Ecosystem
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center max-w-lg mx-auto">
          <a
            href="/login"
            className="group relative flex-1 bg-slate-900 text-white py-6 px-10 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] hover:-translate-y-2 active:translate-y-0"
          >
            <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10">Access Portal</span>
          </a>
          <a
            href="/register"
            className="flex-1 bg-white border-2 border-slate-100 text-slate-900 py-6 px-10 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 hover:border-primary/30 transition-all hover:shadow-2xl hover:-translate-y-2 active:translate-y-0 shadow-xl shadow-slate-900/5"
          >
            Join Registry
          </a>
        </div>

        <div className="mt-24 flex justify-center gap-16 text-slate-300 font-black tracking-[0.4em] text-[10px] uppercase">
          <span className="hover:text-primary transition-colors cursor-default">AI Copilot</span>
          <span className="hover:text-primary transition-colors cursor-default">
            Data Governance
          </span>
          <span className="hover:text-primary transition-colors cursor-default">Rural Mode</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
