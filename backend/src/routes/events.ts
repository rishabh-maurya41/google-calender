import { Router } from 'express';
import { validateEventCreation, validateEventUpdate } from '../middleware/validation';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';

const router = Router();

/**
 * Event routes with validation middleware and controller functions
 */

// GET /api/events - Retrieve events by date range
router.get('/', getEvents);

// POST /api/events - Create a new event with validation
router.post('/', validateEventCreation, createEvent);

// PUT /api/events/:id - Update an existing event with validation
router.put('/:id', validateEventUpdate, updateEvent);

// DELETE /api/events/:id - Delete an event
router.delete('/:id', deleteEvent);

export default router;
