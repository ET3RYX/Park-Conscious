import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import DefaultlayoutHoc from "../layout/Default.layout";

const FailurePage = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get("error") || "Payment Declined";
    const txnId = searchParams.get("txnId") || "TXN_FAILED";

    return (
    <div className="min-h-screen flex items-center justify-center bg-[#050507] py-24 px-8 relative">
        {/* Dynamic Background Glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-600/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-xl w-full text-center space-y-12 animate-reveal relative z-10">
            <div className="relative mx-auto w-32 h-32 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
                <XCircle size={56} className="text-rose-500 animate-pulse" />
                <div className="absolute inset-0 bg-rose-500/10 rounded-[2rem] blur-2xl -z-10 animate-pulse"></div>
            </div>

            <div className="space-y-6 text-center items-center flex flex-col">
                <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.8]">Transaction Failed</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] max-w-sm border-t border-white/5 pt-6">The transaction was not authorized. No credits were debited.</p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-12 text-left space-y-10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
                <div className="space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/10">
                        <AlertTriangle size={24} className="text-rose-500" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Error Details</h4>
                        <p className="text-white font-black text-xl italic uppercase tracking-tighter mt-1">{error}</p>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] mb-2">Transaction ID</p>
                      <code className="text-slate-500 font-mono text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{txnId}</code>
                   </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10 pt-8">
                <button 
                    onClick={() => window.history.back()}
                    className="w-full md:w-auto bg-white text-black px-12 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 group"
                >
                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" /> Try Again
                </button>
                <Link to="/" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all border-b border-transparent hover:border-white/20 pb-1">
                    Return to Home
                </Link>
            </div>
        </div>
    </div>
    );
};

export default DefaultlayoutHoc(FailurePage);
