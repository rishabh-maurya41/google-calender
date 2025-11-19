import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Event,
  EventInput,
  GetEventsResponse,
  CreateEventResponse,
  UpdateEventResponse,
  DeleteEventResponse,
  ApiError,
} from '../types';

/**
 * API client configuration
 * Base URL defaults to localhost:5000 for development
 * Can be overridden with VITE_API_BASE_URL environment variable
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Retry configuration
 */
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Create Axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Determine if an error is retryable
 */
const isRetryableError = (error: AxiosError): boolean => {
  // Retry on network errors or 5xx server errors
  if (!error.response) {
    return true; // Network error
  }
  
  const status = error.response.status;
  return status >= 500 && status < 600; // Server errors
};

/**
 * Get user-friendly error message based on error type
 */
const getUserFriendlyErrorMessage = (error: AxiosError<ApiError>): string => {
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  const status = error.response.status;
  const serverMessage = error.response.data?.error;
  
  switch (status) {
    case 400:
      return serverMessage || 'Invalid request. Please check your input and try again.';
    case 404:
      return serverMessage || 'The requested resource was not found.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again in a moment.';
    default:
      return serverMessage || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Transform error to a consistent format
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = {
        error: getUserFriendlyErrorMessage(error),
        details: error.response.data?.details,
        statusCode: error.response.status,
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response received
      const apiError: ApiError = {
        error: 'Unable to connect to the server. Please check your internet connection and try again.',
        statusCode: 0,
      };
      return Promise.reject(apiError);
    } else {
      // Something else happened
      const apiError: ApiError = {
        error: error.message || 'An unexpected error occurred. Please try again.',
        statusCode: 0,
      };
      return Promise.reject(apiError);
    }
  }
);

/**
 * Retry wrapper for API requests with exponential backoff
 */
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's not a retryable error or if we're out of retries
      if (!isRetryableError(error) || attempt === retries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.log(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Validate date string
 */
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Get events within a date range
 * @param startDate - Start date of the range (ISO 8601 format)
 * @param endDate - End date of the range (ISO 8601 format)
 * @returns Promise resolving to array of events
 */
export const getEvents = async (
  startDate: string,
  endDate: string
): Promise<GetEventsResponse> => {
  // Validate date parameters
  if (!isValidDate(startDate)) {
    const error: ApiError = {
      error: 'Invalid start date provided',
      statusCode: 400,
    };
    console.error('Invalid startDate:', startDate);
    throw error;
  }
  
  if (!isValidDate(endDate)) {
    const error: ApiError = {
      error: 'Invalid end date provided',
      statusCode: 400,
    };
    console.error('Invalid endDate:', endDate);
    throw error;
  }
  
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get<GetEventsResponse>('/api/events', {
        params: {
          startDate,
          endDate,
        },
      });

      // Transform date strings to Date objects and validate
      const events = response.data.map((event) => {
        try {
          return {
            ...event,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
          };
        } catch (err) {
          console.error('Error parsing event dates:', event, err);
          throw new Error('Invalid event data received from server');
        }
      });

      return events;
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Validate event input data
 */
const validateEventInput = (eventData: EventInput | Partial<EventInput>): void => {
  if ('title' in eventData && eventData.title !== undefined) {
    if (typeof eventData.title !== 'string' || eventData.title.trim().length === 0) {
      throw new Error('Event title is required');
    }
  }
  
  if ('startTime' in eventData && eventData.startTime !== undefined) {
    if (!(eventData.startTime instanceof Date) || isNaN(eventData.startTime.getTime())) {
      throw new Error('Invalid start time');
    }
  }
  
  if ('endTime' in eventData && eventData.endTime !== undefined) {
    if (!(eventData.endTime instanceof Date) || isNaN(eventData.endTime.getTime())) {
      throw new Error('Invalid end time');
    }
  }
  
  if ('startTime' in eventData && 'endTime' in eventData && 
      eventData.startTime && eventData.endTime) {
    if (eventData.endTime <= eventData.startTime) {
      throw new Error('End time must be after start time');
    }
  }
};

/**
 * Create a new event
 * @param eventData - Event data to create
 * @returns Promise resolving to the created event
 */
export const createEvent = async (
  eventData: EventInput
): Promise<CreateEventResponse> => {
  // Validate input data
  try {
    validateEventInput(eventData);
  } catch (validationError: any) {
    const error: ApiError = {
      error: validationError.message,
      statusCode: 400,
    };
    console.error('Validation error:', validationError.message);
    throw error;
  }
  
  try {
    return await retryRequest(async () => {
      const response = await apiClient.post<CreateEventResponse>(
        '/api/events',
        eventData
      );

      // Transform date strings to Date objects
      const event: Event = {
        ...response.data,
        startTime: new Date(response.data.startTime),
        endTime: new Date(response.data.endTime),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };

      return event;
    });
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Update an existing event
 * @param eventId - ID of the event to update
 * @param eventData - Partial event data to update
 * @returns Promise resolving to the updated event
 */
export const updateEvent = async (
  eventId: string,
  eventData: Partial<EventInput>
): Promise<UpdateEventResponse> => {
  // Validate event ID
  if (!eventId || typeof eventId !== 'string' || eventId.trim().length === 0) {
    const error: ApiError = {
      error: 'Invalid event ID',
      statusCode: 400,
    };
    console.error('Invalid eventId:', eventId);
    throw error;
  }
  
  // Validate input data
  try {
    validateEventInput(eventData);
  } catch (validationError: any) {
    const error: ApiError = {
      error: validationError.message,
      statusCode: 400,
    };
    console.error('Validation error:', validationError.message);
    throw error;
  }
  
  try {
    return await retryRequest(async () => {
      const response = await apiClient.put<UpdateEventResponse>(
        `/api/events/${eventId}`,
        eventData
      );

      // Transform date strings to Date objects
      const event: Event = {
        ...response.data,
        startTime: new Date(response.data.startTime),
        endTime: new Date(response.data.endTime),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };

      return event;
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Delete an event
 * @param eventId - ID of the event to delete
 * @returns Promise resolving to success response
 */
export const deleteEvent = async (
  eventId: string
): Promise<DeleteEventResponse> => {
  // Validate event ID
  if (!eventId || typeof eventId !== 'string' || eventId.trim().length === 0) {
    const error: ApiError = {
      error: 'Invalid event ID',
      statusCode: 400,
    };
    console.error('Invalid eventId:', eventId);
    throw error;
  }
  
  try {
    return await retryRequest(async () => {
      const response = await apiClient.delete<DeleteEventResponse>(
        `/api/events/${eventId}`
      );

      return response.data;
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Export the configured API client for custom requests if needed
 */
export default apiClient;
