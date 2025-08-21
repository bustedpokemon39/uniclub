import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpStepper: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid email');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUniqueId = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup-step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, uniqueId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid unique ID');
      setName(data.name || '');
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup-step3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, uniqueId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    navigate('/auth'); // This will show the AuthPage with signin mode
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Registration Complete!</h2>
        <p className="mb-4">You can now sign in with your UTD email and password.</p>
        <button 
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors" 
          onClick={handleGoToSignIn}
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center mb-6 space-x-2">
        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
        <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
      </div>
      {step === 1 && (
        <form onSubmit={handleEmail} className="space-y-4" noValidate>
          <div>
            <label className="block mb-1 font-medium">UTD Email</label>
            <input
              type="text"
              className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error === 'Please use a valid UTDallas email address.' ? 'Please enter a valid UTDallas email address (ends with @utdallas.edu).' : error}</div>}
          <button type="submit" className="w-full bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition-colors" disabled={loading}>
            {loading ? 'Checking...' : 'Next'}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleUniqueId} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Unique Club ID</label>
            <input
              type="text"
              className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900"
              value={uniqueId}
              onChange={e => setUniqueId(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition-colors" disabled={loading}>
            {loading ? 'Checking...' : 'Next'}
          </button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Create Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition-colors" disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SignUpStepper; 