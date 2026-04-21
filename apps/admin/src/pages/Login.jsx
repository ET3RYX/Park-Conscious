import React, { useState } from 'react';
import { Shield, Mail, Lock, Activity, ChevronRight, RefreshCw, Star } from 'lucide-react';
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
      login(data); 
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization failed. Verify system credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center p-6 selection:bg-sky-500/30 relative overflow-hidden font-inter">
      {/* Visual Depth Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-sky-600/10 blur-[140px] rounded-full animate-pulse " style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="glass-card rounded-[3rem] p-12 md:p-16">
          <div className="flex flex-col items-center mb-14">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 shadow-2xl relative group overflow-hidden transition-all hover:border-sky-500/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="text-sky-500 relative z-10 group-hover:scale-110 transition-transform duration-700" size={32} />
            </div>
            <h1 className="text-3xl font-black text-zinc-100 tracking-tighter uppercase text-center leading-none">
              Backstage
              <span className="block text-[8px] text-zinc-600 font-bold tracking-[0.6em] mt-4 opacity-70">Access Control Terminal</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em] ml-1">Identity</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-sky-500 transition-colors" size={16} />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@backstage.com"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-14 py-4 text-zinc-100 text-xs focus:outline-none focus:border-sky-500/20 transition-all font-medium placeholder:text-zinc-800 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-sky-500 transition-colors" size={16} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-14 py-4 text-zinc-100 text-xs focus:outline-none focus:border-sky-500/20 transition-all font-medium placeholder:text-zinc-800 font-mono shadow-inner"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 p-4 rounded-2xl animate-in slide-in-from-top-2">
                <div className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <p className="text-red-400 text-[9px] font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-[#050508] font-black py-5 rounded-2xl shadow-2xl shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  Initialize Session
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 flex items-center justify-between border-t border-white/[0.02] pt-8 opacity-40">
              <div className="flex items-center gap-2">
                  <Activity size={10} className="text-emerald-500" />
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Core Active</span>
              </div>
              <div className="flex items-center gap-2">
                  <Star size={10} className="text-sky-500" />
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Backstage v4.2</span>
              </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[9px] text-zinc-800 font-bold uppercase tracking-[0.4em] opacity-40">
          Restricted Resource &bull; Authorization Required
        </p>
      </div>
    </div>
  );
};

export default Login;
