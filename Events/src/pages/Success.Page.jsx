import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Download, Calendar, MapPin } from "lucide-react";
import DefaultlayoutHoc from "../layout/Default.layout";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const txnId = searchParams.get("txnId") || "TXN_PROCESSED";

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#040b17] py-20 px-8">
      <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        {/* Animated Checkmark */}
        <div className="relative mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
          <CheckCircle size={48} className="text-emerald-500 animate-bounce" />
          <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl animate-pulse -z-10"></div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Ticket Confirmed!</h1>
          <p className="text-slate-400 font-medium">Your payment was successful and your entry QR has been generated.</p>
        </div>

        {/* Ticket Details Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-left space-y-8 backdrop-blur-xl">
           <div className="flex justify-between items-start border-b border-white/5 pb-6">
              <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Transaction ID</p>
                 <code className="text-sky-500 font-mono text-sm">{txnId}</code>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status</p>
                 <span className="text-emerald-500 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">Verified Success</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Entry Date</p>
                 <div className="flex items-center gap-2 text-white font-bold uppercase text-sm">
                    <Calendar size={14} className="text-sky-500" />
                    <span>June 2, 2026</span>
                 </div>
              </div>
              <div className="space-y-2 text-right">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Digital Ticket</p>
                 <span className="text-white font-bold uppercase text-xs">Ready for Scan</span>
              </div>
           </div>

           <div className="pt-4">
              <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5">
                 <Download size={16} /> Download e-Ticket
              </button>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
           <Link to="/" className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition flex items-center gap-2">
              Back to Catalog <ArrowRight size={14} />
           </Link>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(SuccessPage);
