import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Activity, ChevronRight, Loader2, Sparkles } from 'lucide-react';
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
      setError(err.response?.data?.message || 'Authorization failed. Verify your system credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-sky-500/30 relative overflow-hidden">
      {/* Background Micro-geometry */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 shadow-2xl shadow-slate-950/50">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group mb-8 transition-all hover:border-sky-500/50">
              <ShieldCheck className="text-sky-500 group-hover:scale-110 transition-transform duration-500" size={40} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase text-center leading-none">
              Backstage
              <span className="block text-[10px] text-sky-500 font-black tracking-[0.4em] mt-3 opacity-80">Access Control Terminal</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">System Identity</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@parkconscious.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-14 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all shadow-inner font-medium placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-14 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all shadow-inner font-medium placeholder:text-slate-700 font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-sky-900/20 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Initialize Session
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 flex items-center justify-between border-t border-slate-800 pt-8">
              <div className="flex items-center gap-2">
                  <Activity size={12} className="text-emerald-500" />
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Core Active</span>
              </div>
              <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-slate-700" />
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Park Conscious v4.0</span>
              </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] opacity-50">
          Restricted Resource &bull; Authorization Required
        </p>
      </div>
    </div>
  );
};

export default Login;
