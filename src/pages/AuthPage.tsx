import React, { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpStepper from './SignUpStepper';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 rounded-l-xl ${mode === 'signin' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`px-4 py-2 rounded-r-xl ${mode === 'signup' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>
        {mode === 'signin' ? <SignInForm /> : <SignUpStepper />}
      </div>
    </div>
  );
};

export default AuthPage; 