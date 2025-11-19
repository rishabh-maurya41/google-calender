/**
 * Example usage of the API service layer
 * This file demonstrates how to use the API functions in components
 */

import { getEvents, createEvent, updateEvent, deleteEvent } from './api';
import { EventInput, ApiError } from '../types';

/**
 * Example: Fetch events for the current week
 */
export const fetchWeekEvents = async () => {
  try {
    // Calculate start and end of current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    const events = await getEvents(
      startOfWeek.toISOString(),
      endOfWeek.toISOString()
    );

    console.log(`Fetched ${events.length} events for the week`);
    return events;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Failed to fetch events:', apiError.error);
    throw error;
  }
};

/**
 * Example: Create a new event with validation
 */
export const createNewEvent = async (eventData: EventInput) => {
  try {
    // Validate that end time is after start time
    if (eventData.endTime <= eventData.startTime) {
      throw new Error('End time must be after start time');
    }

    const newEvent = await createEvent(eventData);
    console.log('Event created successfully:', newEvent._id);
    return newEvent;
  } catch (error) {
    const apiError = error as ApiError;
    
    if (apiError.statusCode === 400) {
      console.error('Validation error:', apiError.details);
    } else if (apiError.statusCode === 0) {
      console.error('Network error - server may be down');
    } else {
      console.error('Failed to create event:', apiError.error);
    }
    
    throw error;
  }
};

/**
 * Example: Update an event with partial data
 */
export const updateEventTitle = async (eventId: string, newTitle: string) => {
  try {
    const updatedEvent = await updateEvent(eventId, {
      title: newTitle,
    });
    
    console.log('Event title updated successfully');
    return updatedEvent;
  } catch (error) {
    const apiError = error as ApiError;
    
    if (apiError.statusCode === 404) {
      console.error('Event not found');
    } else {
      console.error('Failed to update event:', apiError.error);
    }
    
    throw error;
  }
};

/**
 * Example: Delete an event with confirmation
 */
export const deleteEventWithConfirmation = async (eventId: string) => {
  try {
    const result = await deleteEvent(eventId);
    
    if (result.success) {
      console.log('Event deleted successfully:', result.message);
    }
    
    return result;
  } catch (error) {
    const apiError = error as ApiError;
    
    if (apiError.statusCode === 404) {
      console.error('Event not found - may have been already deleted');
    } else {
      console.error('Failed to delete event:', apiError.error);
    }
    
    throw error;
  }
};

/**
 * Example: Handle multiple operations with error recovery
 */
export const batchCreateEvents = async (eventsData: EventInput[]) => {
  const results = {
    successful: [] as string[],
    failed: [] as { data: EventInput; error: string }[],
  };

  for (const eventData of eventsData) {
    try {
      const event = await createEvent(eventData);
      results.successful.push(event._id);
    } catch (error) {
      const apiError = error as ApiError;
      results.failed.push({
        data: eventData,
        error: apiError.error,
      });
    }
  }

  console.log(`Batch create completed: ${results.successful.length} successful, ${results.failed.length} failed`);
  return results;
};
