import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { eventService } from '../services/api';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

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

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="text-sky-500/50 animate-spin" size={32} />
        <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest leading-none">Retrieving Record</p>
      </div>
    );
  }

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
      
      <div className="glass-card rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none rotate-12">
            <Loader2 size={320} className={loading ? 'animate-spin' : ''} />
        </div>
        <EventForm initialData={event} onSubmit={handleUpdate} loading={loading} />
      </div>
    </div>
  );
};

export default EditEvent;
