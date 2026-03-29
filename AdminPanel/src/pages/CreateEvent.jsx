import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { eventService } from '../services/api';
import { ChevronLeft } from 'lucide-react';

const CreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      await eventService.create(formData);
      navigate('/events');
    } catch (error) {
      console.error('Failed to create event', error);
      // The error is now also shown inside the EventForm via state if needed, 
      // but we'll keep this as a fallback.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest mb-4 transition"
          >
            <ChevronLeft size={14} /> Back to Repository
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Deploy New Event</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Initial configuration of a new Park Conscious experience.</p>
        </div>
      </div>
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2rem] p-4 md:p-8">
        <EventForm onSubmit={handleCreate} loading={loading} />
      </div>
    </div>
  );
};

export default CreateEvent;
