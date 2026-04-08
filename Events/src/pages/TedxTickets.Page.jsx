import React, { useState, useEffect } from "react";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/DiscussionAuth.context";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Camera, ShieldCheck, MapPin, Calendar, Info, Clock, CheckCircle2, AlertCircle, Loader2, Ticket } from 'lucide-react';

const TedxTicketsPage = () => {
  const { user } = useAuth();
  
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  // Scroll to top automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file);
      setScreenshotUrl(url);
    } catch (err) {
      setError(`Media Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleBookingClick = async () => {
    if (!name.trim()) return setError("Please enter your name.");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
    if (!phone || phone.length < 10) return setError("Please enter a valid 10-digit phone.");
    if (!screenshotUrl) return setError("Please upload a screenshot (ID or Payment Proof) to proceed.");

    setError("");
    setLoading(true);

    try {
      const response = await backendAxios.post(`/api/pay`, {
        name,
        email, 
        amount: 0, // Ticket is FREE
        phone,
        userId: user ? (user.uid || user.id) : name,
        eventId: "tedx_ggsipu_2026",
        screenshotUrl
      });

      if (response.data && response.data.success) {
        setSuccess(true);
      } else {
        setError("Booking failed. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error during registration.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#050507] min-h-screen text-white flex items-center justify-center p-6 md:p-8">
        <div className="max-w-xl w-full bg-white/5 border border-emerald-500/20 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-20 text-center space-y-10 shadow-2xl backdrop-blur-3xl">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tighter uppercase italic">Registration Success</h2>
             <p className="text-slate-500 text-[10px] font-black tracking-[0.4em] uppercase leading-relaxed">
               Your credentials for TEDx GGSIPU: SANGAM have been logged. Global verification in progress.
             </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-white text-black font-black py-6 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95 uppercase tracking-[0.3em] text-[11px]"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050507] min-h-screen text-white pt-24 pb-12 font-sans selection:bg-red-600/30 relative">
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        {/* Dynamic TEDx Red Gradient Hero — Editorial Version */}
        <div className="relative w-full h-[32rem] rounded-[3.5rem] overflow-hidden mb-12 md:mb-24 flex items-center justify-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 bg-[#050507]">
          {/* Breathing Mesh Background */}
          <div className="absolute top-0 right-0 w-full h-full bg-red-600/5 blur-[120px] rounded-full animate-mesh pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-950/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-8">
            <div className="flex items-center gap-4 bg-white/5 px-8 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
              <span className="text-red-500 font-black tracking-[0.4em] uppercase text-[10px] md:text-sm">TEDx</span>
              <span className="text-white/40 font-bold tracking-[0.3em] uppercase text-[9px] md:text-xs">GGSIPU EDC CAMPUS</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-7xl md:text-[11rem] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 leading-[0.8] animate-reveal pb-2 italic">SANGAM</h1>
              <p className="text-slate-500 font-bold tracking-[0.4em] uppercase text-[10px] md:text-sm mt-8 max-w-2xl border-t border-white/5 pt-8 mx-auto">Ideas, Perspectives, and Voices Converge</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          {/* Details */}
          <div className="lg:col-span-7 space-y-24 mt-4">
            <section className="space-y-10">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Event Manifesto</h2>
              <div className="space-y-6 text-slate-400 text-2xl leading-[1.6] font-medium max-w-3xl italic">
                <p>
                  SANGAM signifies a confluence — a place where rivers meet and flow together.
                </p>
                <p>
                   Meaningful ideas emerge when disciplines interact and cultures engage. This is the intersection of the future.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 space-y-6 hover:bg-white/[0.07] transition-all duration-500 shadow-2xl">
                  <MapPin className="text-red-600" size={28} />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Event Location</h4>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">East Campus • USAR Sector</p>
               </div>
               <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 space-y-6 hover:bg-white/[0.07] transition-all duration-500 shadow-2xl">
                  <Calendar className="text-red-600" size={28} />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Date & Time</h4>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">Registration Active • Limited Seats</p>
               </div>
            </section>
          </div>

          {/* Registration Card */}
          <div className="lg:col-span-5 relative z-10 w-full mb-12">
            <div className="sticky top-32 bg-white/5 border border-white/5 rounded-[3.5rem] p-10 md:p-14 shadow-2xl backdrop-blur-3xl space-y-12">
              <div className="text-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-12">Ticket Registration</h3>
              </div>

              <div className="bg-red-600/5 border border-red-600/10 rounded-[2rem] p-8 flex justify-between items-center group transition-all cursor-default">
                <div className="space-y-1">
                  <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-white">Standard Access</h4>
                  <p className="text-[8px] text-red-700/60 font-black uppercase tracking-widest leading-none">Global Credentials</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-red-600 italic">OPEN</span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-10">
                  <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-3">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Full Name</label>
                      <input 
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Full Name"
                        className="w-full bg-[#050507] border border-white/5 rounded-2xl px-8 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Email Address</label>
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-[#050507] border border-white/5 rounded-2xl px-8 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Phone Number</label>
                      <input 
                        type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number" maxLength={10}
                        className="w-full bg-[#050507] border border-white/5 rounded-2xl px-8 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload Block */}
                  <div className="pt-2">
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 ml-1">Upload ID / Proof</label>
                    <label className={`relative flex items-center justify-center gap-4 w-full bg-[#050507] border border-white/5 rounded-[2rem] p-10 transition-all cursor-pointer shadow-inner ${screenshotUrl ? 'border-emerald-500/20 bg-emerald-500/5' : 'hover:bg-white/[0.02]'}`}>
                      <input type="file" className="hidden" onChange={handleScreenshotUpload} disabled={uploading}/>
                      {uploading ? (
                         <div className="flex items-center gap-4 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">
                           <Loader2 className="animate-spin" size={18} /> Syncing Data...
                         </div>
                      ) : screenshotUrl ? (
                         <div className="flex items-center gap-4 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em]">
                           <CheckCircle2 size={18} /> Data Confirmed
                         </div>
                      ) : (
                         <div className="flex items-center gap-4 text-slate-700 font-black text-[10px] uppercase tracking-[0.2em]">
                           <Camera size={20} /> Select Image
                         </div>
                      )}
                    </label>
                  </div>
                </div>
                
                {error && (
                  <div className="p-6 bg-red-600/5 border border-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-4 animate-reveal">
                    <AlertCircle size={20} /> {error}
                  </div>
                )}

                <button 
                  onClick={handleBookingClick}
                  disabled={loading || uploading}
                  className="w-full bg-red-600 text-white font-black py-6 rounded-full shadow-[0_20px_40px_-10px_rgba(220,38,38,0.2)] hover:bg-white hover:text-red-600 transition-all active:scale-95 disabled:opacity-40 mt-4 uppercase tracking-[0.3em] text-[11px] flex items-center justify-center px-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin shrink-0" size={18} />
                      <span className="flex-1 text-center">Processing Registration...</span>
                      <div className="w-4 shrink-0" />
                    </>
                  ) : (
                    <>
                      <Ticket className="shrink-0" size={18} />
                      <span className="flex-1 text-center">Reserve Ticket</span>
                      <div className="w-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(TedxTicketsPage);
