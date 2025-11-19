import React, { useEffect } from 'react';
import { useCalendar } from '../context';
import { getWeekEnd } from '../utils/dateUtils';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import Spinner from './Spinner';
import { EventInput } from '../types';
import './WeekView.css';

/**
 * WeekView Container Component
 * 
 * Main container component that:
 * - Manages current week state
 * - Fetches events on mount and week change
 * - Handles loading and error states
 * - Passes data to child components (CalendarHeader, CalendarGrid)
 * - Implements week navigation logic
 * 
 * Requirements: 1.5, 5.2, 5.3, 5.4, 9.1, 10.1
 */
const WeekView: React.FC = () => {
  const {
    currentWeekStart,
    events,
    loading,
    error,
    modal,
    fetchEvents,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    openModal,
    closeModal,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
  } = useCalendar();

  // Fetch events when component mounts or when week changes
  useEffect(() => {
    const weekEnd = getWeekEnd(currentWeekStart);
    fetchEvents(currentWeekStart, weekEnd);
  }, [currentWeekStart, fetchEvents]);

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    const weekEnd = getWeekEnd(currentWeekStart);
    fetchEvents(currentWeekStart, weekEnd);
  };

  // Handle time slot click - open modal for creating new event
  const handleTimeSlotClick = (date: Date, hour: number) => {
    openModal(null, date, hour);
  };

  // Handle event click - open modal for editing existing event
  const handleEventClick = (event: any) => {
    openModal(event);
  };

  // Handle save event (create or update)
  const handleSaveEvent = async (eventInput: EventInput) => {
    if (modal.event) {
      // Update existing event
      await updateEvent(modal.event._id, eventInput);
    } else {
      // Create new event
      await createEvent(eventInput);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  return (
    <div className="week-view">
      <CalendarHeader
        weekStart={currentWeekStart}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onToday={goToToday}
        loading={loading}
      />
      
      <div className="week-view-content">
        {/* Loading State */}
        {loading && (
          <div className="week-view-loading">
            <Spinner size="large" message="Loading events..." />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="week-view-error">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Events</h3>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="retry-button">
                🔄 Retry
              </button>
            </div>
            <p className="error-hint">
              {error.includes('connect') || error.includes('network') || error.includes('server')
                ? 'Please check your internet connection and ensure the server is running.'
                : 'If the problem persists, try refreshing the page.'}
            </p>
          </div>
        )}

        {/* Success State - Calendar Grid */}
        {!loading && !error && (
          <CalendarGrid
            weekStart={currentWeekStart}
            events={events}
            onTimeSlotClick={handleTimeSlotClick}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={modal.isOpen}
        event={modal.event}
        initialDate={modal.initialDate}
        initialHour={modal.initialHour}
        onClose={closeModal}
        onSave={handleSaveEvent}
        onDelete={modal.event ? handleDeleteEvent : undefined}
      />
    </div>
  );
};

export default WeekView;
