import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FilePlus,
  LogOut,
  Stethoscope,
  MessageCircle,
  Search,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';
import NotificationBell from '../../components/NotificationBell';
import NavProfile from '../../components/NavProfile';

const DoctorMessaging = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get(`/messages/conversations/${userId}`);
        setConversations(response.data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchConversations();
    else setLoading(false);
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col hidden md:flex sticky top-0 h-screen z-20 shadow-2xl shadow-slate-200/20">
        <div className="p-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Stethoscope className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                Health
              </h1>
              <span className="text-primary font-bold text-sm uppercase tracking-widest">
                Horizon
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
            { icon: MessageCircle, label: 'Messages', path: '/doctor/messaging', active: true },
            { icon: User, label: 'My Profile', path: '/doctor/profile' },
            { icon: FilePlus, label: 'Issue Prescription', path: '/doctor/issue-prescription' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group ${item.active ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${item.active ? 'text-primary' : ''}`}
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 relative overflow-hidden group mb-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
              Internal
            </p>
            <p className="text-sm font-bold text-white relative z-10">Clinical Protocol v2.5</p>
            <button className="mt-4 text-xs font-black text-slate-900 bg-white px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all relative z-10">
              Review
            </button>
          </div>

          <NavProfile />

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-5 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all group mt-2"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Patient Messages</h2>
              <p className="text-slate-500 font-medium mt-1">
                Communicate securely with your patients under clinical privacy standards.
              </p>
            </div>
            <NotificationBell />
          </div>

          {/* Search Box */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search patients or conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none font-bold text-slate-700 transition-all"
            />
          </div>

          {/* Conversations List */}
          <div className="rounded-[3rem] border border-sky-100/80 bg-gradient-to-br from-white via-sky-50/20 to-indigo-50/10 shadow-xl shadow-slate-200/50 overflow-hidden divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No active messages</h3>
                <p className="text-slate-400 font-medium">
                  When patients message your clinic, their correspondence ledger will populate here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.participantId}
                  onClick={() => setSelectedChat({ id: conv.participantId, name: conv.participantName })}
                  className="p-8 flex items-center gap-6 hover:bg-white/80 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-primary group-hover:scale-105 transition-all overflow-hidden relative">
                    {conv.participantProfilePictureUrl ? (
                      <img
                        src={`http://localhost:8081${conv.participantProfilePictureUrl}`}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="text-primary font-black text-xl">
                        {conv.participantName.charAt(0)}
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] text-white font-black">{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                        {conv.participantName}
                      </h4>
                      {conv.lastMessageTimestamp && (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(conv.lastMessageTimestamp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 font-semibold truncate pr-10">
                      {conv.lastMessage || 'Start a conversation...'}
                    </p>
                  </div>

                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {selectedChat && (
        <ChatWindow
          currentUser={{ id: userId }}
          recipientId={selectedChat.id}
          recipientName={selectedChat.name}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default DoctorMessaging;
