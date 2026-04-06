import React, { useState, useEffect } from "react";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/DiscussionAuth.context";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Camera, ShieldCheck, MapPin, Calendar, Info, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
      setError("Server error during registration.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#050507] min-h-screen text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0D0D12] border border-emerald-500/20 rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Booking Initiated!</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your request for TEDx GGSIPU EDC has been received. Our team will verify your details and screenshot. You'll receive a confirmation email shortly.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050507] min-h-screen text-white pt-24 pb-12 font-sans selection:bg-red-600/30">
      <div className="container mx-auto px-4 md:px-12">
        {/* Dynamic TEDx Red Gradient Hero */}
        <div className="relative w-full h-64 sm:h-80 md:h-[28rem] rounded-3xl md:rounded-[3rem] overflow-hidden mb-12 flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#1a0000] to-[#3a0000]">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-800/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="flex items-center gap-3 bg-red-600/10 px-6 py-2 rounded-full border border-red-600/20 backdrop-blur-md">
              <span className="text-red-600 font-black tracking-[0.4em] uppercase text-xs md:text-sm">TEDx</span>
              <span className="text-white/60 font-bold tracking-widest uppercase text-[10px] md:text-xs">GGSIPU EDC</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 pb-2">SANGAM</h1>
            <p className="text-gray-300 font-medium tracking-[0.2em] uppercase text-xs md:text-sm mt-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">Ideas, Perspectives, and Voices Converge</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Details */}
          <div className="lg:col-span-7 space-y-16 mt-4">
            <section className="space-y-6">
              <h2 className="text-3xl font-black flex items-center gap-4 text-white uppercase tracking-tight">
                <span className="w-1.5 h-10 bg-red-600 rounded-full"></span>
                The Theme
              </h2>
              <div className="space-y-4 text-gray-400 text-lg leading-relaxed font-light">
                <p>
                  The word <strong>SANGAM</strong> signifies a confluence — a place where rivers meet and flow together. In India, the Triveni Sangam at Prayagraj symbolises the meeting of the Ganga, Yamuna, and the mythical Saraswati. Each river carries its own history, yet together they form something greater.
                </p>
                <p>
                  Human progress rarely occurs in isolation. Meaningful ideas emerge when disciplines interact, cultures engage, and personal experiences encounter new knowledge. SANGAM represents this convergence.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-[#0D0D12] p-8 rounded-3xl border border-white/5 space-y-4">
                  <MapPin className="text-red-600" size={24} />
                  <h4 className="font-bold text-xl uppercase tracking-tight">Venue</h4>
                  <p className="text-gray-500 text-sm">East Delhi Campus (USAR), Guru Gobind Singh Indraprastha University.</p>
               </div>
               <div className="bg-[#0D0D12] p-8 rounded-3xl border border-white/5 space-y-4">
                  <Calendar className="text-red-600" size={24} />
                  <h4 className="font-bold text-xl uppercase tracking-tight">Date</h4>
                  <p className="text-gray-500 text-sm">Join us for a day of innovation and transformation.</p>
               </div>
            </section>
          </div>

          {/* Registration Card */}
          <div className="lg:col-span-5 relative z-10 w-full mb-12">
            <div className="sticky top-24 bg-[#0D0D12] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">Reserve Entry</h3>
                <p className="text-gray-500 text-sm mt-1">Limited seats available for SANGAM '26.</p>
              </div>

              <div className="bg-red-600/5 border border-red-600/20 rounded-2xl p-6 flex justify-between items-center group hover:bg-red-600/10 transition-all cursor-default">
                <div>
                  <h4 className="font-bold text-lg text-white">General Admission</h4>
                  <p className="text-xs text-red-500/60 font-black uppercase tracking-widest mt-1">Open Access</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-red-600">FREE</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                      <input 
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-red-600/50 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-red-600/50 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                      <input 
                        type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number" maxLength={10}
                        className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-red-600/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload Block */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Upload ID Or Verification Screenshot</label>
                    <label className={`relative flex items-center justify-center gap-3 w-full bg-[#16161C] border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer ${screenshotUrl ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/5 hover:border-red-600/30'}`}>
                      <input type="file" className="hidden" onChange={handleScreenshotUpload} disabled={uploading}/>
                      {uploading ? (
                         <div className="flex items-center gap-3 text-red-500 font-bold text-xs uppercase tracking-tighter animate-pulse">
                           <Loader2 className="animate-spin" size={16} /> Uploading...
                         </div>
                      ) : screenshotUrl ? (
                         <div className="flex items-center gap-3 text-emerald-500 font-bold text-xs uppercase tracking-tighter">
                           <CheckCircle2 size={16} /> Upload Complete
                         </div>
                      ) : (
                         <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-tighter">
                           <Camera size={16} /> Select Screenshot
                         </div>
                      )}
                    </label>
                  </div>
                </div>
                
                {error && <div className="p-4 bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold rounded-2xl flex items-center gap-3">
                  <AlertCircle size={16} /> {error}
                </div>}

                <button 
                  onClick={handleBookingClick}
                  disabled={loading || uploading}
                  className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-900/10 hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-4"
                >
                  {loading ? "Confirming Entry..." : "Confirm TEDx Reservation"}
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
