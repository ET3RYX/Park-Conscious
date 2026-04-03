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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest mb-4 transition"
          >
            <ChevronLeft size={14} /> Back to Repository
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Edit Experience</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Modifying entity: <span className="text-slate-300 not-italic">"{event?.title}"</span></p>
        </div>
      </div>
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2rem] p-4 md:p-8">
        <EventForm initialData={event} onSubmit={handleUpdate} loading={loading} />
      </div>
    </div>
  );
};

export default EditEvent;
