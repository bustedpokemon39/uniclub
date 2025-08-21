import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PopupContextType {
  showUserProfile: boolean;
  openUserProfile: () => void;
  closeUserProfile: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [showUserProfile, setShowUserProfile] = useState(false);

  const openUserProfile = () => setShowUserProfile(true);
  const closeUserProfile = () => setShowUserProfile(false);

  return (
    <PopupContext.Provider value={{ showUserProfile, openUserProfile, closeUserProfile }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) throw new Error('usePopup must be used within a PopupProvider');
  return context;
}; 