import express from 'express';
import { 
  getEvents, 
  getAdminEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from '../controllers/eventController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';
import { upload } from '../config/cloudinary.js';


const router = express.Router();

// Error handler for validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const eventValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  body('locationName').notEmpty().withMessage('Location name is required'),
  body('price').isNumeric().withMessage('Price must be a number')
];

// Public Routes
router.get('/', getEvents);

// Admin Routes (Protected) — MUST be before /:id to avoid Express matching "upload" or "admin" as an ID
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ url: req.file.path });
  } else {
    res.status(400).json({ message: 'No image uploaded' });
  }
});

router.get('/admin/all', protect, admin, getAdminEvents);

router.post('/', protect, admin, eventValidationRules, validate, createEvent);
router.put('/:id', protect, admin, eventValidationRules, validate, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

// This MUST be last — /:id is a catch-all param route
router.get('/:id', getEventById);

export default router;
