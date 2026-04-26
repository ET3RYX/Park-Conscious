import React, { useState } from "react";
import { backendAxios } from "../axios";
import { Helmet } from "react-helmet";
import DefaultlayoutHoc from "../layout/Default.layout";
import { Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react';

import { reportSystemError } from "../utils/monitoring";

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const response = await backendAxios.post("/api/contact", formData);
      if (response.data.success) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({ loading: false, success: false, error: response.data.message || "Failed to send message" });
      }
    } catch (err) {
      console.error("Support form error:", err);
      setStatus({ loading: false, success: false, error: "Failed to connect to server." });
      reportSystemError("Support Form Submission Failed", "api_failure", { error: err.message });
    }
  };

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-24 w-full selection:bg-indigo-500/30">
      <Helmet>
        <title>SUPPORT | BACKSTAGE</title>
        <meta name="description" content="Contact the BACKSTAGE support team for any queries or assistance." />
      </Helmet>

      {/* Hero Section */}
      <div className="w-full relative py-32 md:py-48 flex flex-col items-center overflow-hidden isolation-isolate">
        {/* Animated Background Mesh */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-mesh pointer-events-none z-0"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-mesh pointer-events-none z-0" style={{ animationDelay: '-5s' }}></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex flex-col items-center">
            <h1 className="text-7xl sm:text-8xl md:text-[10rem] font-black uppercase tracking-tight leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none animate-reveal">
              GET IN
            </h1>
            <h1 className="text-7xl sm:text-8xl md:text-[10rem] font-black uppercase tracking-tight leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-800/20 select-none pb-4 animate-reveal -mt-1 sm:-mt-2 md:-mt-4" style={{ animationDelay: '0.2s' }}>
              TOUCH.
            </h1>
          </div>

          <div className="mt-8 md:mt-12 max-w-xl mx-auto animate-reveal" style={{ animationDelay: '0.4s' }}>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed uppercase tracking-[0.4em] text-[10px] md:text-[12px]">
              EXPERIENCING AN ISSUE? OUR TEAM IS STANDING BY.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 -mt-10">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">

          {/* Contact Form - Full Width */}
          <div className="w-full animate-reveal" style={{ animationDelay: '0.6s' }}>
            <div className="card-glass p-10 md:p-14 rounded-[3rem] border border-white/5 relative overflow-hidden">
              {status.success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-4">Message Received</h3>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                    Thanks for reaching out! Our team has received your query and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setStatus({ ...status, success: false })}
                    className="btn-editorial"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Send a Message</h2>
                    <p className="text-slate-400 text-sm">Please fill out the form below and we'll be in touch.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Message</label>
                      <textarea
                        name="message"
                        required
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you today?"
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-6 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all resize-none"
                      ></textarea>
                    </div>

                    {status.error && (
                      <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{status.error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status.loading}
                      className={`group relative flex items-center justify-center gap-4 w-full py-5 bg-white text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-50`}
                    >
                      {status.loading ? "Processing..." : (
                        <>
                          Dispatch Message
                          <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Support Information - Below Form */}
          <div className="w-full flex flex-col md:flex-row gap-8 animate-reveal" style={{ animationDelay: '0.8s' }}>
            <div className="flex-1 card-glass p-8 rounded-[2rem] border border-white/5">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">Contact Info</h3>
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Us</p>
                    <a href="mailto:help@parkconscious.in" className="text-white hover:text-indigo-400 transition-colors font-medium">help@parkconscious.in</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Chat</p>
                    <p className="text-white font-medium">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/3 bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2rem] flex flex-col justify-center">
              <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-2">Priority Support</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Event organizers and premium members get priority response times under 2 hours.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(SupportPage);
