import Event from '../models/Event.js';

// @desc    Get all active events (Public)
// @route   GET /api/events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true, status: 'published' }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events (Admin)
// @route   GET /api/admin/events
export const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event && event.isActive) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/admin/events
export const createEvent = async (req, res) => {
  try {
    const { 
      title, description, date, endDate, 
      locationName, locationAddress, lat, lng,
      images, category, price, capacity, status 
    } = req.body;

    const event = new Event({
      title,
      description,
      date,
      endDate,
      location: {
        name: locationName,
        address: locationAddress,
        coordinates: { lat, lng }
      },
      images,
      category,
      price,
      capacity,
      status,
      createdBy: req.user._id
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/admin/events/:id
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = req.body.title || event.title;
      event.description = req.body.description || event.description;
      event.date = req.body.date || event.date;
      event.endDate = req.body.endDate || event.endDate;
      
      if (req.body.locationName) {
        event.location.name = req.body.locationName;
      }
      if (req.body.locationAddress) {
        event.location.address = req.body.locationAddress;
      }
      if (req.body.lat !== undefined) {
        event.location.coordinates.lat = req.body.lat;
      }
      if (req.body.lng !== undefined) {
        event.location.coordinates.lng = req.body.lng;
      }

      event.images = req.body.images || event.images;
      event.category = req.body.category || event.category;
      event.price = req.body.price !== undefined ? req.body.price : event.price;
      event.capacity = req.body.capacity !== undefined ? req.body.capacity : event.capacity;
      event.status = req.body.status || event.status;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Soft delete an event
// @route   DELETE /api/admin/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.isActive = false;
      await event.save();
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
