import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import DefaultlayoutHoc from "../layout/Default.layout";

const FailurePage = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get("error") || "Payment Declined";
    const txnId = searchParams.get("txnId") || "TXN_FAILED";

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#040b17] py-20 px-8">
            <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <div className="relative mx-auto w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                    <XCircle size={48} className="text-rose-500" />
                    <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-2xl -z-10"></div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Transaction Failed</h1>
                    <p className="text-slate-400 font-medium">We couldn't process your payment. No funds were debited from your account.</p>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-12 text-left space-y-6">
                    <div className="flex items-center gap-4 text-rose-500">
                        <AlertTriangle size={24} />
                        <h4 className="font-black uppercase tracking-widest text-xs">Error Detail</h4>
                    </div>
                    <p className="text-slate-300 font-mono text-sm uppercase">{error}</p>
                    <div className="pt-4">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Tracking ID</p>
                        <code className="text-slate-400 text-xs">{txnId}</code>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
                    <button 
                        onClick={() => window.history.back()}
                        className="bg-sky-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-500 transition-all flex items-center gap-3 shadow-xl shadow-sky-900/20"
                    >
                        <RefreshCw size={16} /> Retry Booking
                    </button>
                    <Link to="/" className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition">
                        Cancel & Return
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DefaultlayoutHoc(FailurePage);
