import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Calendar,
  LogOut,
  Bell,
  Heart,
  Search,
  LifeBuoy,
} from 'lucide-react';
import NavProfile from './NavProfile';
import { playTapSound } from '../utils/audio';

const PatientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/patient/book-appointment' },
    { icon: Bell, label: 'Pill Reminders', path: '/patient/reminders' },
    { icon: Search, label: 'Find Doctors', path: '/patient/search' },
    { icon: User, label: 'My Profile', path: '/patient/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col hidden md:flex sticky top-0 h-screen z-20 shadow-2xl shadow-slate-200/20">
      <div className="p-10">
        <div
          className="flex items-center gap-4 group cursor-pointer"
          onClick={() => {
            playTapSound();
            navigate('/patient/dashboard');
          }}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-300">
            <Heart className="w-7 h-7 text-white fill-white/20" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Health
            </h1>
            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">
              Horizon
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2">
        <p className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={playTapSound}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-2' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 opacity-100 z-0"></div>
              )}
              <item.icon
                className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 duration-300 ${isActive ? 'text-primary' : ''}`}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8">
        <div
          onClick={() => {
            playTapSound();
            navigate('/patient/support');
          }}
          className="bg-gradient-to-br from-indigo-50 to-sky-50 p-6 rounded-3xl border border-indigo-100/50 relative overflow-hidden group mb-6 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <LifeBuoy className="w-6 h-6 text-indigo-500 mb-3" />
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
            Support Center
          </p>
          <p className="text-sm font-bold text-slate-700 relative z-10">Care team available 24/7</p>
        </div>

        <NavProfile />

        <button
          onClick={() => {
            playTapSound();
            handleLogout();
          }}
          className="flex items-center gap-4 w-full px-6 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all group mt-2"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default PatientSidebar;
