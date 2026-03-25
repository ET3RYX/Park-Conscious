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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-[#0F172A] w-full max-w-2xl rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden border border-white/5 animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-fuchsia-600 to-emerald-500"></div>
        
        <div className="p-10 md:p-14">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all hover:rotate-90">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-fuchsia-600 mb-6 shadow-lg shadow-fuchsia-500/20">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase leading-none">
              List Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-fuchsia-500">Event</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">Partner with Park Conscious and manage your event parking like a pro.</p>
          </div>

          {status.message && (
            <div className={`mb-8 p-5 rounded-2xl text-sm font-bold text-center border animate-in slide-in-from-top-4 duration-300 ${
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Event Title</label>
              <input required name="eventName" value={formData.eventName} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-slate-700" placeholder="e.g. Urban Tech Summit 2026" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Your Name</label>
              <input name="contactName" value={formData.contactName} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Contact Email</label>
              <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-slate-700" placeholder="john@event.com" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Tell us about the event</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-700" placeholder="Crowd size, dates, location..."></textarea>
            </div>

            <button disabled={loading} type="submit" className="md:col-span-2 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-fuchsia-600/20 hover:shadow-fuchsia-600/40 transform hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-lg mt-4">
              {loading ? 'Processing...' : 'Send Proposal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestEventModal;
