import React, { useState } from 'react';
import { Activity, ShieldCheck, Mail, Lock, Loading } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authService.login(username, password);
      login(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBackground-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-premier-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-vibrantBlue/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg bg-darkBackground-800 border border-white/5 rounded-[4rem] p-12 shadow-2xl relative z-10 backdrop-blur-3xl animate-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-premier-400 to-vibrantBlue flex items-center justify-center shadow-2xl shadow-premier-500/40 mb-8 border border-white/20">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase text-center leading-none">Admin Nexus</h1>
          <p className="text-gray-500 text-xs mt-3 font-black uppercase tracking-[0.2em]">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Identifier</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@parkconscious.com"
                className="w-full bg-darkBackground-900 border border-white/5 rounded-3xl px-16 py-5 text-white focus:outline-none focus:border-premier-400/50 transition-all font-medium placeholder:text-gray-700 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Credential</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-darkBackground-900 border border-white/5 rounded-3xl px-16 py-5 text-white focus:outline-none focus:border-premier-400/50 transition-all font-medium placeholder:text-gray-700 shadow-inner"
              />
            </div>
          </div>

          {error && <p className="text-rose-400 text-xs font-black bg-rose-400/10 p-5 rounded-3xl border border-rose-400/20 text-center uppercase tracking-widest animate-shake">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-premier-400 to-vibrantBlue text-white font-black py-6 rounded-3xl shadow-2xl shadow-premier-500/30 hover:shadow-premier-500/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {loading ? 'Validating...' : 'Authenticate'}
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] text-gray-600 uppercase tracking-widest font-black flex items-center justify-center gap-2">
          <Activity size={12} className="text-vibrantBlue" /> v3.0 // Security Core Active
        </p>
      </div>
    </div>
  );
};

export default Login;
