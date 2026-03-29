import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { eventService } from '../services/api';

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
        alert('Could not find event or lost connection.');
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
      alert('Failed to update event. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-12 h-12 rounded-full border-t-2 border-premier-400 border-r-2 border-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Update <span className="text-premier-400">Prototype</span></h1>
        <p className="text-gray-400 mt-2 font-medium">Refining the details for <span className="text-white">"{event?.title}"</span>.</p>
      </div>
      <EventForm initialData={event} onSubmit={handleUpdate} loading={loading} />
    </div>
  );
};

export default EditEvent;
