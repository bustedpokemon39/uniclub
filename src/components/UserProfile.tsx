import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Bell, HelpCircle, LogOut, Bookmark, Moon, Sun, ArrowLeft } from 'lucide-react';
import { Linkedin } from 'lucide-react';
import UserHeader from './UserHeader';
import SettingsListItem from './SettingsListItem';
import BottomNavigation from './BottomNavigation';
import { useUser } from '../context/UserContext';
import SettingsPage from '../pages/SettingsPage';
import { useTheme } from '../context/ThemeContext';
import ProfilePictureUpload from './ProfilePictureUpload';
import AvatarManagementModal from './AvatarManagementModal';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/auth');
  };

  const profileOptions = [
    {
      icon: Settings,
      label: 'Settings',
      action: () => setShowSettings(true),
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => navigate('/notifications'),
      color: 'text-blue-600'
    },
    {
      icon: Bookmark,
      label: 'Saved Posts',
      action: () => navigate('/saved'),
      color: 'text-purple-600'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => navigate('/help'),
      color: 'text-orange-600'
    },
    {
      icon: isDarkMode ? Sun : Moon,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      action: toggleDarkMode,
      color: 'text-yellow-600'
    },
    {
      icon: Linkedin,
      label: 'Connect on LinkedIn',
      action: () => window.open('https://linkedin.com', '_blank'),
      color: 'text-blue-700'
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: handleLogout,
      color: 'text-red-600'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-6 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow mr-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h1>
      </div>

      {/* User Info Section */}
      <div className="flex items-center gap-4 pt-6 pb-2 px-6">
        <div className="flex-shrink-0 cursor-pointer relative" onClick={() => setShowAvatarModal(true)}>
          <ProfilePictureUpload 
            size="xl" 
            showUploadButton={false}
            allowDelete={false}
            className="hover:opacity-80 transition-opacity"
          />
          {/* Edit indicator */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
            <Settings className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
            {user?.name || 'User'}
          </h3>
          {user?.major && user?.year && (
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-tight">
              {user.major} • {user.year}
            </p>
          )}
          {user?.email && (
            <p className="text-gray-400 dark:text-gray-500 text-xs leading-tight">{user.email}</p>
          )}
          {user?.memberId && (
            <p className="text-emerald-600 dark:text-emerald-500 text-xs font-semibold mt-1">
              ID: {user.memberId}
            </p>
          )}
        </div>
      </div>

      {/* Profile Options List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="space-y-2">
          {profileOptions.map((option, index) => (
            <SettingsListItem
              key={index}
              icon={<option.icon className={option.color} />}
              label={option.label}
              type="navigation"
              onClick={option.action}
              colorClass={option.color}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation />
      </div>

      {/* SettingsPage Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center">
          <div className="w-full h-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <SettingsPage onBack={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {/* Avatar Management Modal */}
      <AvatarManagementModal 
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
      />
    </div>
  );
};

export default UserProfile;
