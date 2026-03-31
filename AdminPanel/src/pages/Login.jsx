import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Activity, ChevronRight } from 'lucide-react';
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

  const [apiStatus, setApiStatus] = useState('checking');

  React.useEffect(() => {
    const checkApi = async () => {
      try {
        await authService.checkStatus();
        setApiStatus('online');
      } catch (err) {
        setApiStatus('offline');
      }
    };
    checkApi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(username, password);
      
      // Safety check for non-JSON responses (e.g. Vercel fallback HTML)
      if (typeof response.data !== 'object') {
        throw new Error('SERVER_CONFIG_ERROR');
      }

      login(response.data.user);
      navigate('/');
    } catch (err) {
        setLoading(false);
        console.error('CRITICAL LOGIN FAILURE:', {
          message: err.message,
          code: err.code,
          config: err.config,
          response: err.response ? {
            status: err.response.status,
            data: err.response.data
          } : 'NO_RESPONSE'
        });

        if (err.message === 'Network Error' || !err.response) {
            setError(`Security Terminal Unreachable (Code: ${err.code || 'UNKNOWN'}). This usually means the API endpoint ${err.config?.url || ''} is blocked or down. Please check your browser console (F12) for details.`);
        } else if (err.response) {
            const data = err.response.data;
            if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
                setError('API Error: The server returned an HTML page instead of JSON. This suggests a routing issue on the backend.');
            } else {
                setError(data?.message || `Terminal Rejected Request (Status: ${err.response.status})`);
            }
        } else {
            setError('System reported an anomaly: ' + err.message);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-sky-500/20">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner mb-6 relative">
            <ShieldCheck className="text-sky-500" size={32} />
            <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
              apiStatus === 'offline' ? 'bg-rose-500' : 'bg-slate-600'
            }`} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Admin Nexus</h1>
          <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Secured Production Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identifier</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@parkconscious.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-12 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/30 transition shadow-inner placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Credential</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-12 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/30 transition shadow-inner placeholder:text-slate-700"
              />
            </div>
          </div>

          {error && <p className="text-rose-400 text-[10px] font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/10 text-center uppercase tracking-widest">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-900/10 hover:bg-sky-500 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
          >
            {loading ? 'Authenticating...' : (
              <>
                Authenticate <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-center justify-center gap-6">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold flex items-center gap-1.5 group">
                <Activity size={10} className={apiStatus === 'online' ? 'text-emerald-500' : 'text-slate-500'} /> 
                System {apiStatus === 'online' ? 'Active' : apiStatus === 'offline' ? 'Unreachable' : 'Checking...'}
            </p>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">v3.2 // TLS 1.3</p>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">Authorized Access Only</p>
    </div>
  );
};

export default Login;
