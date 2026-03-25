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
          onClose();
          setFormData({
            eventName: '',
            description: '',
            contactName: '',
            contactEmail: '',
          });
          setStatus({ type: '', message: '' });
        }, 3000);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-[#0F172A] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-fuchsia-600 to-emerald-500"></div>
        
        <div className="p-8 md:p-10">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">
              List Your <span className="text-fuchsia-500">Event</span>
            </h2>
            <p className="text-slate-400 text-xs font-medium">Partner with us for smarter parking.</p>
          </div>

          {status.message && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-bold text-center border animate-in slide-in-from-top-4 duration-300 ${
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Event Title</label>
              <input required name="eventName" value={formData.eventName} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all text-sm placeholder:text-slate-700" placeholder="e.g. Sunburn 2026" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Your Name</label>
                <input name="contactName" value={formData.contactName} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm placeholder:text-slate-700" placeholder="Name" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Contact Email</label>
                <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all text-sm placeholder:text-slate-700" placeholder="email@work.com" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Details (Optional)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm resize-none placeholder:text-slate-700" placeholder="Briefly describe..."></textarea>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-fuchsia-600/20 hover:shadow-fuchsia-600/40 transform hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-base mt-2">
              {loading ? 'Processing...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestEventModal;
;
