import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { backendAxios } from "../../axios";
import { useAuth } from "../../context/DiscussionAuth.context";
import { X, CheckCircle2, AlertCircle, Loader2, CreditCard, User, Mail, Phone, ShieldCheck } from 'lucide-react';

const BookingModal = ({ isOpen, setIsOpen, event }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const [customData, setCustomData] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill user data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: ""
      });
      setCustomData({});
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

    // Custom Fields Validation
    if (event.customForms && event.customForms.length > 0) {
      for (const field of event.customForms) {
        if (field.required && !customData[field.id]?.trim()) {
          return setError(`${field.label} is required`);
        }
      }
    }

    setLoading(true);

    try {
      const response = await backendAxios.post("/api/pay", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        amount: event.displayPrice || 0,
        userId: user ? (user.uid || user.id) : (formData.name || "Guest"),
        eventId: event.id || event._id,
        customData: customData
      });

      if (response.data?.success && response.data?.orderId) {
        const loadScript = (src) => new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            setError("Payment SDK failed to load. Please check connection.");
            setLoading(false);
            return;
        }

        const options = {
            key: response.data.key,
            amount: response.data.amount,
            currency: "INR",
            name: "BACKSTAGE",
            description: event.displayTitle || event.title || "Event Tickets",
            order_id: response.data.orderId,
            handler: async function (paymentResponse) {
                try {
                    const verifyRes = await backendAxios.post("/api/payment-callback", paymentResponse);
                    if (verifyRes.data?.success) {
                        window.location.href = `/payment-success?txnId=${verifyRes.data.txnId}`;
                    } else {
                        setError("Payment verification failed.");
                        setLoading(false);
                    }
                } catch (err) {
                    setError("Payment verification failed. Please contact support.");
                    setLoading(false);
                }
            },
            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone
            },
            theme: { color: "#4f46e5" },
            modal: {
                ondismiss: function() {
                    setLoading(false);
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function () {
            setError("Payment failed! Please try again.");
            setLoading(false);
        });
        paymentObject.open();

      } else if (response.data?.success && response.data?.redirectUrl) {
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-[#050507] border border-white/5 p-6 md:p-16 text-left align-middle shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transition-all relative">
                {/* Dynamic Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">Booking Summary</h3>
                    <p className="text-slate-500 text-[10px] mt-3 font-black uppercase tracking-[0.3em]">{event.displayTitle}</p>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full border border-white/5"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleBooking} className="space-y-8 md:space-y-10 relative z-10">
                  <div className="grid grid-cols-1 gap-6 md:gap-10">
                    {reqFields.name && (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white transition-colors" size={18} />
                          <input 
                            type="text" name="name" value={formData.name} onChange={handleInputChange}
                            placeholder="Full Legal Name"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    )}

                    {reqFields.email && (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white transition-colors" size={18} />
                          <input 
                            type="email" name="email" value={formData.email} onChange={handleInputChange}
                            placeholder="your@email.com"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    )}

                    {reqFields.phone && (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Phone Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white transition-colors" size={18} />
                          <input 
                            type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                            placeholder="10 Digit Contact" maxLength={10}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    )}

                    {event.customForms && event.customForms.length > 0 && event.customForms.map(field => (
                      <div key={field.id} className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">
                          {field.label} {field.required && <span className="text-amber-500">*</span>}
                        </label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border-2 border-slate-700 group-focus-within:border-white transition-colors flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-slate-700 group-focus-within:bg-white rounded-[1px] transition-colors" />
                          </div>
                          <input 
                            type="text" 
                            name={field.id} 
                            value={customData[field.id] || ''} 
                            onChange={(e) => setCustomData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={`Your ${field.label}`}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="p-6 bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-4">
                      <AlertCircle size={20} /> {error}
                    </div>
                  )}

                  <div className="pt-6 space-y-8">
                    <button 
                      type="submit" disabled={loading}
                      className="w-full bg-indigo-600 text-white font-black py-6 rounded-full hover:bg-white hover:text-indigo-600 transition-all shadow-2xl active:scale-95 disabled:opacity-40 mt-4 uppercase tracking-[0.3em] text-[11px] flex items-center justify-center px-12"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin shrink-0" size={20} />
                          <span className="flex-1 text-center">Securing Ticket...</span>
                          <div className="w-5 shrink-0" />
                        </>
                      ) : (
                        <>
                          <CreditCard className="shrink-0" size={20} />
                          <span className="flex-1 text-center">{event.displayPrice > 0 ? `Pay • ₹${event.displayPrice}` : "Confirm Ticket Booking"}</span>
                          <div className="w-5 shrink-0" />
                        </>
                      )}
                    </button>
                    
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={12} className="text-white" />
                          <span className="text-[8px] text-white font-black uppercase tracking-[0.4em]">Secure Checkout Gateway</span>
                       </div>
                       <p className="text-center text-[8px] text-slate-600 font-black uppercase leading-relaxed tracking-[0.3em]">
                          Non-Refundable Ticket • Individual Assignment Only
                       </p>
                    </div>
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
