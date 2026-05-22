import { useState, useEffect } from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { io } from 'socket.io-client';
import api, { BASE_URL } from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const userId = localStorage.getItem('userId');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    
    fetchNotifications();

    // Socket.io setup
    const socket = io(BASE_URL, {
      query: { userId }
    });

    socket.on('notification', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    socket.on('connect_error', (err) => {
      console.error('Notification Socket error:', err);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'ALERT':
        return <AlertOctagon className="w-4 h-4 text-orange-500" />;
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-slate-400 hover:text-primary transition-colors relative bg-white rounded-xl shadow-sm border border-slate-200 hover:border-slate-300"
      >
        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 card-modern z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="mt-1">{getTypeIcon(n.type)}</div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                    >
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(n.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 ring-4 ring-primary/10"></div>
                  )}
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <button className="text-xs font-medium text-primary hover:underline">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
