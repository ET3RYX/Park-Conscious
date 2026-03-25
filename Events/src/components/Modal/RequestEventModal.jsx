import React, { useState } from 'react';
import axios from 'axios';

const RequestEventModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    contactName: '',
    contactEmail: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('/api/event-request', formData);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Proposal sent! Our team will reach out shortly.' });
        setTimeout(() => {
          onClose(); // Automatically close modal
          // Reset state *after* modal visually closes to prevent flashing
          setTimeout(() => {
            setFormData({
              eventName: '',
              description: '',
              contactName: '',
              contactEmail: '',
            });
            setStatus({ type: '', message: '' });
          }, 300);
        }, 2000);
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Submission failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-xl w-full mx-auto my-auto h-fit">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(192,38,211,0.4)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">List Your Event</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 flex items-center gap-2">
            <svg className="w-6 h-6 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative">
            {status.message && (
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-max px-6 py-2 rounded-full text-xs font-bold text-center border animate-in slide-in-from-bottom-4 duration-300 shadow-xl ${
                status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {status.message}
              </div>
            )}
            
          <p className="text-slate-400 font-medium mb-10 text-sm">Fill in the details below. Our team will review your proposal and get back to you within 24 hours.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Event Name</label>
                  <input required name="eventName" value={formData.eventName} onChange={handleChange} className="w-full bg-[#0F172A] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-fuchsia-500 transition-all text-sm placeholder:text-slate-700" placeholder="e.g. Neon Nights 2026" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                    <input required name="contactName" value={formData.contactName} onChange={handleChange} className="w-full bg-[#0F172A] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 transition-all text-sm placeholder:text-slate-700" placeholder="John Doe" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                    <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-[#0F172A] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-fuchsia-500 transition-all text-sm placeholder:text-slate-700" placeholder="john@company.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Event Description & Estimated Crowd</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-[#0F172A] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none placeholder:text-slate-700" placeholder="Tell us about the vibes and expected audience..."></textarea>
                </div>
            </div>

            <button disabled={loading || status.type === 'success'} type="submit" className={`w-full bg-gradient-to-r ${status.type === 'success' ? 'from-emerald-500 to-teal-500' : 'from-blue-600 to-fuchsia-600 hover:from-blue-500 hover:to-fuchsia-500'} py-6 rounded-[2rem] text-white font-black text-lg uppercase tracking-[0.2em] transition-all shadow-xl ${status.type === 'success' ? 'shadow-emerald-500/20' : 'shadow-fuchsia-500/10'} active:scale-[0.98] disabled:opacity-70`}>
              {loading ? 'Processing...' : status.type === 'success' ? 'Submitted!' : 'Submit Event Proposal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestEventModal;
;
