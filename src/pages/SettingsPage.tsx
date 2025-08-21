import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, Shield, User, Globe, HelpCircle, ChevronRight, ArrowLeft, Eye, Lock, Smartphone, Mail, Bookmark } from 'lucide-react';
import UserHeader from '../components/UserHeader';
import SettingsListItem from '../components/SettingsListItem';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { usePopup } from '../context/PopupContext';
import { useTheme } from '../context/ThemeContext';

interface SettingsPageProps {
  onBack?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { closeUserProfile } = usePopup();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [faceId, setFaceId] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: isDarkMode ? <Moon className="text-yellow-500" /> : <Sun className="text-yellow-500" />,
          label: 'Dark Mode',
          type: 'toggle',
          value: isDarkMode,
          onChange: toggleDarkMode,
          colorClass: 'text-yellow-500'
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        { icon: <Bell className="text-emerald-600" />, label: 'All Notifications', type: 'toggle', value: notifications, onChange: setNotifications, colorClass: 'text-emerald-600' },
        { icon: <Mail className="text-emerald-600" />, label: 'Email Notifications', type: 'toggle', value: emailNotifications, onChange: setEmailNotifications, colorClass: 'text-emerald-600' },
        { icon: <Smartphone className="text-purple-500" />, label: 'Push Notifications', type: 'toggle', value: pushNotifications, onChange: setPushNotifications, colorClass: 'text-purple-500' }
      ]
    },
    {
      title: 'Security & Privacy',
      items: [
        { icon: <Eye className="text-emerald-600" />, label: 'Face ID', type: 'toggle', value: faceId, onChange: setFaceId, colorClass: 'text-emerald-600' },
        { icon: <Lock className="text-red-500" />, label: 'Biometric Authentication', type: 'toggle', value: biometrics, onChange: setBiometrics, colorClass: 'text-red-500' },
        { icon: <Shield className="text-red-500" />, label: 'Privacy Settings', type: 'navigation', onClick: () => {}, colorClass: 'text-red-500' }
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: <User className="text-emerald-600" />, label: 'Profile Settings', type: 'navigation', onClick: () => {}, colorClass: 'text-emerald-600' },
        { icon: <Globe className="text-emerald-600" />, label: 'Language & Region', type: 'navigation', onClick: () => {}, colorClass: 'text-emerald-600' },
        { icon: <Smartphone className="text-orange-500" />, label: 'Auto-Sync Data', type: 'toggle', value: autoSync, onChange: setAutoSync, colorClass: 'text-orange-500' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle className="text-purple-500" />, label: 'Help & FAQ', type: 'navigation', onClick: () => {}, colorClass: 'text-purple-500' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-6 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onBack ? onBack : () => navigate(-1)}
          className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow mr-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* <UserHeader /> */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4 px-6">
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <SettingsListItem
                  key={itemIndex}
                  icon={item.icon}
                  label={item.label}
                  type={item.type as 'toggle' | 'navigation'}
                  value={item.value}
                  onChange={item.onChange}
                  onClick={item.onClick}
                  colorClass={item.colorClass}
                />
              ))}
            </div>
          </div>
        ))}
        
        {/* App Version */}
        <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs border-t border-gray-100 dark:border-gray-800 mx-6 mt-6">
          <p>AI Club App v1.0.0</p>
          <p>© 2024 UT Dallas</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation onNavigate={closeUserProfile} />
      </div>
    </div>
  );
};

export default SettingsPage;
