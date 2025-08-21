import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  onNavigate?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { 
      id: 'today', 
      label: 'Today', 
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'news', 
      label: 'News', 
      path: '/news',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    { 
      id: 'events', 
      label: 'Events', 
      path: '/events',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'social', 
      label: 'Social', 
      path: '/social',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      path: '/resources',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    }
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    
    // Exact match for home page
    if (path === '/') {
      return currentPath === '/';
    }
    
    // Handle direct page matches and their sub-routes
    if (currentPath === path || currentPath.startsWith(path + '/')) {
      return true;
    }
    
    // Handle special routes that should map to main navigation tabs
    if (path === '/news' && currentPath.startsWith('/article/')) {
      return true; // Article detail pages should highlight News tab
    }
    
    if (path === '/events' && currentPath.startsWith('/event/')) {
      return true; // Event detail pages should highlight Events tab
    }
    
    if (path === '/resources' && currentPath.startsWith('/resource/')) {
      return true; // Resource detail pages should highlight Resources tab
    }
    
    // Handle comments pages based on content type
    if (currentPath.startsWith('/comments/')) {
      const segments = currentPath.split('/');
      const contentType = segments[2]; // /comments/{type}/{id}
      
      if (path === '/news' && contentType === 'news') {
        return true; // News comments should highlight News tab
      }
      if (path === '/events' && contentType === 'event') {
        return true; // Event comments should highlight Events tab
      }
      if (path === '/social' && contentType === 'social') {
        return true; // Social comments should highlight Social tab
      }
      if (path === '/resources' && contentType === 'resource') {
        return true; // Resource comments should highlight Resources tab
      }
    }
    
    return false;
  };

  return (
            <div className="bg-white dark:bg-gray-900 border-t border-emerald-300 dark:border-gray-700 shadow-lg">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (onNavigate) onNavigate();
              navigate(tab.path);
            }}
            aria-label={`Navigate to ${tab.label}`}
            className={`flex-1 flex items-center justify-center py-3 px-2 min-h-[44px] transition-all duration-300 relative ${
              isActive(tab.path)
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500'
            }`}
          >
            {/* Active indicator */}
            {isActive(tab.path) && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-b-full"></div>
            )}
            
            {/* Icon with background highlight for active state */}
            <div 
              className={`p-2 rounded-xl transition-all duration-300 ${
                isActive(tab.path)
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 scale-110'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105'
              }`}
            >
              {tab.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
