import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      // Use the login method from UserContext
      login(data.token, data.user);
      
      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">UTD Email</label>
        <input
          type="email"
          className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition-colors"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default SignInForm; 