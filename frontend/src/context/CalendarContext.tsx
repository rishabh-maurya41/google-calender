import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Event, EventInput } from '../types';
import { startOfWeek } from 'date-fns';
import * as api from '../services/api';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ModalState {
  isOpen: boolean;
  event: Event | null;
  initialDate?: Date;
  initialHour?: number;
}

interface CalendarState {
  // Events
  events: Event[];
  
  // Current week
  currentWeekStart: Date;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Modal state
  modal: ModalState;
  
  // Notifications
  notifications: Notification[];
}

interface CalendarContextType extends CalendarState {
  // Event actions
  fetchEvents: (startDate: Date, endDate: Date) => Promise<void>;
  createEvent: (eventInput: EventInput) => Promise<void>;
  updateEvent: (id: string, eventInput: Partial<EventInput>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Week navigation actions
  setCurrentWeekStart: (date: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  
  // Modal actions
  openModal: (event?: Event | null, initialDate?: Date, initialHour?: number) => void;
  closeModal: () => void;
  
  // Notification actions
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  
  // Error handling
  clearError: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [state, setState] = useState<CalendarState>({
    events: [],
    currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
    loading: false,
    error: null,
    modal: {
      isOpen: false,
      event: null,
    },
    notifications: [],
  });

  // Notification actions (defined early to be used in other callbacks)
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { id, message, type }],
    }));
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  // Event actions
  const fetchEvents = useCallback(async (startDate: Date, endDate: Date) => {
    // Validate dates before making API call
    if (!startDate || isNaN(startDate.getTime())) {
      const errorMessage = 'Invalid start date';
      console.error(errorMessage, startDate);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      addNotification(errorMessage, 'error');
      return;
    }
    
    if (!endDate || isNaN(endDate.getTime())) {
      const errorMessage = 'Invalid end date';
      console.error(errorMessage, endDate);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      addNotification(errorMessage, 'error');
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const events = await api.getEvents(startDate.toISOString(), endDate.toISOString());
      
      // Validate received events data
      if (!Array.isArray(events)) {
        throw new Error('Invalid events data received from server');
      }
      
      setState(prev => ({ ...prev, events, loading: false }));
    } catch (error: any) {
      // Handle API errors with proper error messages
      const errorMessage = error?.error || error?.message || 'Failed to fetch events';
      console.error('Error fetching events:', error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      addNotification(errorMessage, 'error');
    }
  }, [addNotification]);

  const createEvent = useCallback(async (eventInput: EventInput) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newEvent = await api.createEvent(eventInput);
      
      // Validate created event data
      if (!newEvent || !newEvent._id) {
        throw new Error('Invalid event data received from server');
      }
      
      setState(prev => ({
        ...prev,
        events: [...prev.events, newEvent],
        loading: false,
        modal: { isOpen: false, event: null },
      }));
      addNotification('Event created successfully', 'success');
    } catch (error: any) {
      // Handle API errors with proper error messages
      const errorMessage = error?.error || error?.message || 'Failed to create event';
      console.error('Error creating event:', error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      addNotification(errorMessage, 'error');
      throw error;
    }
  }, [addNotification]);

  const updateEvent = useCallback(async (id: string, eventInput: Partial<EventInput>) => {
    // Validate event ID
    if (!id || typeof id !== 'string') {
      const errorMessage = 'Invalid event ID';
      console.error(errorMessage, id);
      addNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updatedEvent = await api.updateEvent(id, eventInput);
      
      // Validate updated event data
      if (!updatedEvent || !updatedEvent._id) {
        throw new Error('Invalid event data received from server');
      }
      
      setState(prev => ({
        ...prev,
        events: prev.events.map(e => e._id === id ? updatedEvent : e),
        loading: false,
        modal: { isOpen: false, event: null },
      }));
      addNotification('Event updated successfully', 'success');
    } catch (error: any) {
      // Handle API errors with proper error messages
      const errorMessage = error?.error || error?.message || 'Failed to update event';
      console.error('Error updating event:', error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      addNotification(errorMessage, 'error');
      throw error;
    }
  }, [addNotification]);

  const deleteEvent = useCallback(async (id: string) => {
    // Validate event ID
    if (!id || typeof id !== 'string') {
      const errorMessage = 'Invalid event ID';
      console.error(errorMessage, id);
      addNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await api.deleteEvent(id);
      setState(prev => ({
        ...prev,
        events: prev.events.filter(e => e._id !== id),
        loading: false,
        modal: { isOpen: false, event: null },
      }));
      addNotification('Event deleted successfully', 'success');
    } catch (error: any) {
      // Handle API errors with proper error messages
      const errorMessage = error?.error || error?.message || 'Failed to delete event';
      console.error('Error deleting event:', error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      addNotification(errorMessage, 'error');
      throw error;
    }
  }, [addNotification]);

  // Week navigation actions
  const setCurrentWeekStart = useCallback((date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    setState(prev => ({ ...prev, currentWeekStart: weekStart }));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setState(prev => {
      const newWeekStart = new Date(prev.currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      return { ...prev, currentWeekStart: newWeekStart };
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setState(prev => {
      const newWeekStart = new Date(prev.currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      return { ...prev, currentWeekStart: newWeekStart };
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = startOfWeek(new Date(), { weekStartsOn: 1 });
    setState(prev => ({ ...prev, currentWeekStart: today }));
  }, []);

  // Modal actions
  const openModal = useCallback((event?: Event | null, initialDate?: Date, initialHour?: number) => {
    setState(prev => ({
      ...prev,
      modal: {
        isOpen: true,
        event: event || null,
        initialDate,
        initialHour,
      },
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      modal: {
        isOpen: false,
        event: null,
      },
    }));
  }, []);



  // Error handling
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: CalendarContextType = {
    ...state,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setCurrentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearError,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
