import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { backendAxios } from "../../axios";
import { useAuth } from "../../context/DiscussionAuth.context";
import { X, CheckCircle2, AlertCircle, Loader2, CreditCard, User, Mail, Phone } from 'lucide-react';

const BookingModal = ({ isOpen, setIsOpen, event }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill user data
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: ""
      });
    }
  }, [user, isOpen]);

  const closeModal = () => {
    if (!loading) setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");

    const reqFields = event.requiredFields || { name: true, email: true, phone: true };

    // Validation
    if (reqFields.name && !formData.name.trim()) return setError("Name is required");
    if (reqFields.email && (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))) return setError("Valid email is required");
    if (reqFields.phone && (!formData.phone || formData.phone.length < 10)) return setError("Valid 10-digit phone number is required");

    setLoading(true);

    try {
      const response = await backendAxios.post("/api/pay", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        amount: event.displayPrice || 0,
        userId: user ? (user.uid || user.id) : (formData.name || "Guest"),
        eventId: event.id || event._id,
        // We'll add more context if needed
      });

      if (response.data?.success && response.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else if (response.data?.success && response.data?.amount === 0) {
          // Handle free events
          alert("Registration Successful!");
          closeModal();
      } else {
        setError("Failed to initiate booking. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const reqFields = event.requiredFields || { name: true, email: true, phone: true };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-[#0D0D12] border border-white/10 p-8 md:p-10 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Reserve Your Spot</h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium italic">Confirms your entry for {event.displayTitle}</p>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleBooking} className="space-y-6">
                  {reqFields.name && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input 
                          type="text" name="name" value={formData.name} onChange={handleInputChange}
                          placeholder="Your Name"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {reqFields.email && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input 
                          type="email" name="email" value={formData.email} onChange={handleInputChange}
                          placeholder="name@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {reqFields.phone && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input 
                          type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                          placeholder="10-digit number" maxLength={10}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold rounded-2xl flex items-center gap-3">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-sky-900/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-xs"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          {event.displayPrice > 0 ? `Pay ₹${event.displayPrice} Securely` : "Claim Free Entry"}
                        </>
                      )}
                    </button>
                    <p className="text-center text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-6">
                      Secure Transaction • Official Park Conscious Partner
                    </p>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BookingModal;
