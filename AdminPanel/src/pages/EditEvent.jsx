import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { eventService } from '../services/api';
import { ChevronLeft, Loader2 } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="text-sky-500 animate-spin" size={40} />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Retrieving Record</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate('/events')}
            className="group flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-sky-500 uppercase tracking-[0.3em] mb-6 transition-all"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Asset Repository
          </button>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4 leading-none">
            Modify Protocol
            <div className="h-1 w-12 bg-sky-600 rounded-full" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-4">
            Reconfiguring entity: <span className="text-sky-400 font-bold tracking-tight">"{event?.title || event?.name}"</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-full bg-slate-950">
                UID: {id.slice(-8).toUpperCase()}
            </span>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
            <Loader2 size={320} className={loading ? 'animate-spin' : ''} />
        </div>
        <EventForm initialData={event} onSubmit={handleUpdate} loading={loading} />
      </div>
    </div>
  );
};

export default EditEvent;
