import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import { X, Sparkles, User, Mail, Info, Send, CalendarCloud, Globe, Zap } from 'lucide-react';

const RequestEventModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    contactName: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/event-request`, formData);
      if (response.data.success) {
        alert("Success! Your event proposal has been submitted.");
        setFormData({ eventName: '', description: '', contactName: '', contactEmail: '' });
        onClose();
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || 'Submission failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-[#050507]/90 backdrop-blur-3xl animate-in fade-in duration-500">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-500/10 opacity-50 pointer-events-none" />

      {/* Modal Container - Centering Wrapper */}
      <div className="min-h-full flex items-center justify-center p-4 md:p-12 lg:p-24 relative z-10">
        
        {/* Modal Box */}
        <div className="relative w-full max-w-2xl bg-[#08080a] border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />
        
        {/* Header Area */}
        <div className="p-8 md:p-12 pb-0 flex justify-between items-start relative z-10">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <Zap size={16} className="text-indigo-400 fill-indigo-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Proposal Submission</span>
             </div>
             <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
                List Your <span className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-8">Event</span>
             </h2>
             <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] max-w-sm pt-4 leading-relaxed">
                Connect your experience with thousands of seekers across Delhi NCR.
             </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-all hover:rotate-90 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area / Form */}
        <div className="p-8 md:p-12 overflow-y-auto relative z-10 custom-scrollbar">
           <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Event Concept */}
              <div className="space-y-4">
                 <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                    <Sparkles size={14} className="text-indigo-500" /> Event Concept
                 </label>
                 <input 
                    required 
                    name="eventName" 
                    value={formData.eventName} 
                    onChange={handleChange} 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                    placeholder="E.G. NEON NIGHTS 2026 / AFFAIRES D'ART..." 
                 />
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                       <User size={14} className="text-indigo-500" /> Liaison Name
                    </label>
                    <input 
                       required 
                       name="contactName" 
                       value={formData.contactName} 
                       onChange={handleChange} 
                       className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                       placeholder="WHO ARE YOU?" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                       <Mail size={14} className="text-indigo-500" /> Secure Email
                    </label>
                    <input 
                       required 
                       type="email" 
                       name="contactEmail" 
                       value={formData.contactEmail} 
                       onChange={handleChange} 
                       className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                       placeholder="EMAIL@IDENTITY.COM" 
                    />
                 </div>
              </div>

              {/* Description Area */}
              <div className="space-y-4">
                 <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                    <Info size={14} className="text-indigo-500" /> Experience Protocol
                 </label>
                 <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="4" 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium resize-none"
                    placeholder="DESCRIBE THE VIBE, AUDIENCE, AND LOGISTICS..."
                 />
              </div>

              {/* Submission Button Area */}
              <div className="pt-6">
                 <button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full group relative flex items-center justify-center gap-4 bg-white text-black hover:bg-indigo-600 hover:text-white transition-all duration-500 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                 >
                    {loading ? (
                       <Zap size={18} className="animate-spin text-black group-hover:text-white" />
                    ) : (
                       <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    {loading ? 'Initializing Proposal...' : 'Transmit Proposal'}
                 </button>
                 <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 text-center mt-8">
                    By submitting, you agree to our curator protocols & listing terms.
                 </p>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default RequestEventModal;
