import React from 'react';
import { useUser } from '../context/UserContext';

const UserHeader: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="text-center mb-4 px-6">
      <div className="relative mx-auto mb-3 w-20 h-20">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 overflow-hidden">
          {user.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-2xl font-bold">{user.name.charAt(0)}</span>
          )}
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{user.name}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-xs">{user.major} • {user.year}</p>
      <p className="text-gray-400 dark:text-gray-500 text-xs">{user.email}</p>
      <p className="text-green-600 text-xs font-semibold mt-1">ID: {user.memberId}</p>
    </div>
  );
};

export default UserHeader; 