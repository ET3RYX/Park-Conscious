import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { eventService } from '../services/api';

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
      alert('Failed to create event. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight underline-vibrantBlue uppercase">New Event Prototype</h1>
        <p className="text-gray-400 mt-2 font-medium">Drafting a new experience for the Park Conscious platform.</p>
      </div>
      <EventForm onSubmit={handleCreate} loading={loading} />
    </div>
  );
};

export default CreateEvent;
