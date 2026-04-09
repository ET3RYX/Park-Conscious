import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail, 
  Key, 
  Copy, 
  CheckCircle2, 
  X,
  Loader2,
  ShieldAlert,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import { userService, eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RoleBadge = ({ role }) => {
  const isSuper = role === 'superadmin';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
      isSuper 
        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    }`}>
      <Shield size={10} />
      {role || 'organizer'}
    </span>
  );
};

const Settings = () => {
  const { admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'organizer', assignedEventIds: [] });
  const [allEvents, setAllEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);

  const isSuperAdmin = admin?.role === 'superadmin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
      fetchEvents();
    }
  }, [isSuperAdmin]);

  const fetchEvents = async () => {
    try {
      const { data } = await eventService.getAll();
      setAllEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userService.create(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'organizer', assignedEventIds: [] });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this administrator? This action cannot be undone.')) return;
    try {
      await userService.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const copyCredentials = (user) => {
    const text = `BACKSTAGE Portal Access\nEmail: ${formData.email}\nPassword: ${formData.password}\nPortal: admin.events.parkconscious.in`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (!isSuperAdmin) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-2xl shadow-rose-500/10">
          <ShieldAlert size={48} className="text-rose-500" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Access Restricted</h2>
          <p className="mt-2 text-slate-500 text-sm font-medium leading-relaxed">
            System configuration and team protocols are locked. Please contact a Super Administrator to modify organizational permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <SettingsIcon size={12} /> System Management
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            TEAM PROTOCOLS
            <div className="h-1 w-12 bg-sky-500 rounded-full" />
          </h1>
          <p className="text-slate-500 text-sm font-medium">Manage organizational access and assign partner permissions.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="group relative flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-sky-400 hover:text-white"
        >
          <UserPlus size={16} />
          Add Organizer
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Users size={18} className="text-sky-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Administrators</h3>
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest mt-0.5">Live permission registry</p>
              </div>
            </div>
            <button onClick={fetchUsers} className="text-slate-500 hover:text-white transition-colors">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/30 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-8 py-5">Profile Entity</th>
                  <th className="px-8 py-5">Access Level</th>
                  <th className="px-8 py-5">Identification</th>
                  <th className="px-8 py-5 text-right">System Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-sky-500" size={32} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Syncing Registry...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.map(user => (
                  <tr key={user._id} className="group hover:bg-slate-800/20 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-700 text-white font-bold text-xs uppercase shadow-lg group-hover:scale-110 transition-transform">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Internal Hash: {user._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail size={12} className="text-slate-600" />
                        <span className="text-xs font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {user._id !== admin.id && (
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !submitting && setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500" />
            
            <form onSubmit={handleCreateUser} className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Register Organizer</h2>
                  <p className="text-slate-500 text-xs mt-1 font-medium tracking-wide">Initialize new organizational credentials.</p>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Email</label>
                  <input 
                    required
                    type="email" 
                    placeholder="Email address"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Password</label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="Secure pass"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-700 pr-12"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, password: Math.random().toString(36).slice(-10)})}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-400 p-1"
                        title="Generate Random"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Permissions</label>
                    <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
                    >
                      <option value="organizer">Organizer</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </div>

                {/* Event Assignment Section */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience Assignment</label>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest ml-1 mt-0.5">Select events to assign immediately</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        const allIds = allEvents.map(e => e._id);
                        const allSelected = formData.assignedEventIds.length === allEvents.length;
                        setFormData({ ...formData, assignedEventIds: allSelected ? [] : allIds });
                      }}
                      className="text-[9px] font-black text-sky-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      {formData.assignedEventIds.length === allEvents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="max-h-[160px] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl p-2 custom-scrollbar">
                    {allEvents.length === 0 ? (
                      <div className="py-8 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest">
                        No events available to assign
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {allEvents.map(event => (
                          <label key={event._id} className="flex items-center gap-3 p-2.5 hover:bg-slate-900 rounded-xl cursor-pointer group transition-all">
                            <input 
                              type="checkbox"
                              checked={formData.assignedEventIds.includes(event._id)}
                              onChange={(e) => {
                                const ids = e.target.checked 
                                  ? [...formData.assignedEventIds, event._id]
                                  : formData.assignedEventIds.filter(id => id !== event._id);
                                setFormData({ ...formData, assignedEventIds: ids });
                              }}
                              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-sky-500/20"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-300 group-hover:text-white truncate uppercase tracking-tight">
                                {event.displayTitle || event.title || event.name}
                              </p>
                              <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">
                                {event.status} • {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-2xl shadow-sky-900/40 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  Initialize Credential Hash
                </button>
                
                {formData.email && formData.password && (
                  <button 
                    type="button"
                    onClick={copyCredentials}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {copySuccess ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copySuccess ? 'Copied to Clipboard' : 'Copy Full Credentials'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RefreshCw = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

export default Settings;
