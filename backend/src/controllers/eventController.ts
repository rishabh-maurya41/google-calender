import { Request, Response } from 'express';
import { Event } from '../models/Event';
import mongoose from 'mongoose';

/**
 * Get events by date range
 * Query parameters: startDate, endDate (ISO 8601 format)
 * Returns: Array of Event objects
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    // Build query filter
    const filter: any = {};

    if (startDate || endDate) {
      filter.$and = [];

      if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({
            error: 'Invalid startDate parameter',
            statusCode: 400,
          });
          return;
        }
        // Find events that end after or on the start date
        filter.$and.push({ endTime: { $gte: start } });
      }

      if (endDate) {
        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({
            error: 'Invalid endDate parameter',
            statusCode: 400,
          });
          return;
        }
        // Find events that start before or on the end date
        filter.$and.push({ startTime: { $lte: end } });
      }
    }

    const events = await Event.find(filter).sort({ startTime: 1 });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: 'Internal server error',
      statusCode: 500,
    });
  }
};

/**
 * Create a new event
 * Request body: EventInput (title, description, startTime, endTime, color)
 * Returns: Created Event object
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, startTime, endTime, color } = req.body;

    // Create new event
    const event = new Event({
      title,
      description: description || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      color: color || '#3788d8',
    });

    // Save to database
    const savedEvent = await event.save();

    res.status(201).json(savedEvent);
  } catch (error: any) {
    console.error('Error creating event:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));

      res.status(400).json({
        error: 'Validation failed',
        details,
        statusCode: 400,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      statusCode: 500,
    });
  }
};

/**
 * Update an existing event
 * Request params: id (event ID)
 * Request body: Partial EventInput
 * Returns: Updated Event object
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid event ID format',
        statusCode: 400,
      });
      return;
    }

    const { title, description, startTime, endTime, color } = req.body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (color !== undefined) updateData.color = color;

    // If only endTime is being updated, fetch the current document to validate against current startTime
    if (endTime !== undefined && startTime === undefined) {
      const currentEvent = await Event.findById(id);
      if (currentEvent && new Date(endTime) <= currentEvent.startTime) {
        res.status(400).json({
          error: 'Validation failed',
          details: [{
            field: 'endTime',
            message: 'End time must be after start time',
          }],
          statusCode: 400,
        });
        return;
      }
    }

    // If only startTime is being updated, fetch the current document to validate against current endTime
    if (startTime !== undefined && endTime === undefined) {
      const currentEvent = await Event.findById(id);
      if (currentEvent && new Date(startTime) >= currentEvent.endTime) {
        res.status(400).json({
          error: 'Validation failed',
          details: [{
            field: 'startTime',
            message: 'Start time must be before end time',
          }],
          statusCode: 400,
        });
        return;
      }
    }

    // Find and update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      res.status(404).json({
        error: 'Event not found',
        statusCode: 404,
      });
      return;
    }

    res.status(200).json(updatedEvent);
  } catch (error: any) {
    console.error('Error updating event:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));

      res.status(400).json({
        error: 'Validation failed',
        details,
        statusCode: 400,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      statusCode: 500,
    });
  }
};

/**
 * Delete an event
 * Request params: id (event ID)
 * Returns: Success message
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid event ID format',
        statusCode: 400,
      });
      return;
    }

    // Find and delete event
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      res.status(404).json({
        error: 'Event not found',
        statusCode: 404,
      });
      return;
    }

    res.status(200).json({
      message: 'Event deleted successfully',
      eventId: id,
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      error: 'Internal server error',
      statusCode: 500,
    });
  }
};
