import React, { useEffect, useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import api, { getImageUrl } from '../services/api';

const NavProfile = () => {
  const [profile, setProfile] = useState({
    fullName: localStorage.getItem('fullName') || 'User',
    profilePictureUrl: localStorage.getItem('profilePictureUrl') || null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/me');
        const data = response.data;
        const newProfile = {
          fullName: data.fullName || 'User',
          profilePictureUrl: data.profilePictureUrl || null,
        };
        setProfile(newProfile);
        localStorage.setItem('fullName', newProfile.fullName);
        if (newProfile.profilePictureUrl) {
          localStorage.setItem('profilePictureUrl', newProfile.profilePictureUrl);
        } else {
          localStorage.removeItem('profilePictureUrl');
        }
      } catch (err) {
        console.error('Failed to fetch nav profile', err);
      }
    };

    fetchProfile();

    const handleStorageChange = () => {
      setProfile({
        fullName: localStorage.getItem('fullName') || 'User',
        profilePictureUrl: localStorage.getItem('profilePictureUrl') || null,
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(n => n)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatRole = (role) => {
    if (!role) return 'Access Active';
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const profileSrc = getImageUrl(profile.profilePictureUrl);

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-t border-slate-100 mt-auto">
      <div className="relative group/avatar cursor-pointer">
        <div className="w-12 h-12 p-0.5 rounded-2xl bg-gradient-to-br from-cyan-400 via-primary to-indigo-500 shadow-lg transition-all duration-300 group-hover/avatar:scale-110">
          <div className="w-full h-full rounded-[0.9rem] bg-white overflow-hidden flex items-center justify-center">
            {profileSrc ? (
              <img
                src={profileSrc}
                alt={profile.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ''; // Fallback to icon
                }}
              />
            ) : (
              <span className="text-primary font-black text-sm">{getInitials(profile.fullName)}</span>
            )}
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="font-black text-slate-800 text-sm truncate">{profile.fullName}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
          {formatRole(localStorage.getItem('role'))}
        </p>
      </div>
    </div>
  );
};

export default NavProfile;
