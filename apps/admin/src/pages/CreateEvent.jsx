import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { eventService } from '../services/api';
import { ChevronLeft, AlertTriangle, Star } from 'lucide-react';

const CreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    setLoading(true);
    setGlobalError('');
    try {
      await eventService.create(formData);
      navigate('/events');
    } catch (error) {
      console.error('Failed to create event', error);
      if (error.code === 'ERR_NETWORK') {
        setGlobalError('Network Error: The backend server appears to be offline or unreachable.');
      } else {
        setGlobalError(error.response?.data?.message || error.message || 'An unknown error occurred while deploying the event.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 hover:text-white uppercase tracking-[0.2em] mb-4 transition-all group"
          >
            <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to Repository
          </button>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight uppercase flex items-center gap-3">
             Initialize Asset
             <Star size={20} className="text-sky-500/50" />
          </h1>
          <p className="text-zinc-600 text-xs font-medium mt-1">Deploying a new high-end experience to the Backstage core.</p>
        </div>
      </div>
      
      {globalError && (
        <div className="bg-red-500/5 border border-red-500/10 text-red-400 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 max-w-4xl">
          <AlertTriangle size={16} />
          {globalError}
        </div>
      )}

      <div className="glass-card rounded-[2.5rem] p-6 md:p-10">
        <EventForm onSubmit={handleCreate} loading={loading} />
      </div>
    </div>
  );
};

export default CreateEvent;
