import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { eventService } from '../services/api';
import { ChevronLeft, RefreshCw, Star, Smartphone } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getById(id);
        setEvent(data);
      } catch (error) {
        console.error('Failed to fetch event', error);
        navigate('/events');
      } finally {
        setFetching(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleUpdate = async (formData) => {
    setLoading(true);
    try {
      await eventService.update(id, formData);
      navigate('/events');
    } catch (error) {
      console.error('Failed to update event', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME', themeConfig: newTheme }, '*');
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="text-sky-500/50 animate-spin" size={32} />
        <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest leading-none">Retrieving Record</p>
      </div>
    );
  }

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 hover:text-white uppercase tracking-[0.2em] mb-4 transition-all group"
          >
            <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Asset Repository
          </button>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight uppercase flex items-center gap-3 leading-none">
            Modify Protocol
            <div className="h-[2px] w-8 bg-sky-500 rounded-full opacity-50" />
          </h1>
          <p className="text-zinc-600 text-xs font-medium mt-1">
            Reconfiguring entity: <span className="text-sky-400 font-bold tracking-tight">"{event?.title || event?.name}"</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-full bg-zinc-900/50">
                UID: {id.slice(-8).toUpperCase()}
            </span>
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 xl:max-w-5xl min-w-0">
          <div className="glass-card rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none rotate-12">
                <RefreshCw size={320} className={loading ? 'animate-spin' : ''} />
            </div>
            <EventForm initialData={event} onSubmit={handleUpdate} loading={loading} onThemeChange={handleThemeChange} />
          </div>
        </div>
        
        {/* Live Preview Iframe */}
        <div className="hidden xl:block w-[420px] flex-shrink-0 relative">
          <div className="sticky top-8 space-y-4">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                <Smartphone size={14} className="text-sky-500" /> Live Preview
              </h3>
              <span className="flex items-center gap-2 text-[8px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
            </div>
            
            <div className="w-full h-[850px] rounded-[3rem] border-[12px] border-zinc-900 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] relative bg-black">
              {/* Fake phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-xl z-20"></div>
              <iframe
                ref={iframeRef}
                src={`${frontendUrl}/event/${id}?preview=true`}
                className="w-full h-full border-0 rounded-[2.5rem]"
                title="Live Theme Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
