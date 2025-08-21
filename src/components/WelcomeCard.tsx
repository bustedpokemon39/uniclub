
import React, { useState } from 'react';
import UserProfile from './UserProfile';
import SearchDialog from './SearchDialog';

const WelcomeCard: React.FC = () => {
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-orange-500/90 to-orange-600/90 backdrop-blur-xl rounded-3xl p-6 mb-6 text-white relative overflow-hidden animate-fade-up">
        {/* Background decorative elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-white/40 rounded-full"></div>
        </div>
        <div className="absolute bottom-4 right-8 w-8 h-8 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-2 w-4 h-4 bg-white/20 rounded-full"></div>
        
        <div className="relative z-10">
          {/* Top section with profile, greeting and search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowUserProfile(true)}
                className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <span className="text-white text-sm font-semibold">A</span>
              </button>
              <div>
                <p className="text-white font-semibold text-base">Hello, Ashwin!</p>
                <p className="text-white/80 text-xs">Member ID: UTD-AI-2024-001</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowSearch(true)}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <p className="text-white/80 text-sm mb-6">Discover the latest in AI and technology!</p>
          
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base">AI Club</h3>
              <p className="text-white/80 text-xs">Next meeting in 2 days</p>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
      
      <SearchDialog 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </>
  );
};

export default WelcomeCard;
