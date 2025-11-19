import React from 'react';
import { CalendarGridProps, Event } from '../types';
import { getWeekDays, formatDateForDisplay, isToday, isSameDay } from '../utils/dateUtils';
import TimeSlot from './TimeSlot';
import EventBlock from './EventBlock';
import './CalendarGrid.css';

/**
 * CalendarGrid Component
 * 
 * Renders the 7-day x 24-hour calendar grid with:
 * - 7 columns representing Monday through Sunday
 * - 24 rows representing hourly time slots from 12:00 AM to 11:00 PM
 * - Day headers with dates
 * - Time labels on the left axis
 * - Responsive grid sizing
 * - Grid lines for visual separation
 * 
 * Requirements: 1.1, 1.2, 8.1, 8.4
 */
const CalendarGrid: React.FC<CalendarGridProps> = ({
  weekStart,
  events,
  onTimeSlotClick,
  onEventClick,
}) => {
  // Generate array of 7 days for the week
  const weekDays = getWeekDays(weekStart);

  // Generate array of 24 hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  /**
   * Get events for a specific day
   * @param day - The date to filter events for
   * @returns Array of events that occur on the given day
   */
  const getEventsForDay = (day: Date): Event[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, day);
    });
  };

  /**
   * Calculate layout for overlapping events
   * Returns positioning information for events that overlap in time
   * @param dayEvents - Events for a specific day
   * @returns Array of events with layout information (left offset and width)
   */
  const calculateEventLayout = (dayEvents: Event[]): Array<Event & { left: number; width: number }> => {
    if (dayEvents.length === 0) return [];

    // Sort events by start time, then by duration (longer events first)
    const sortedEvents = [...dayEvents].sort((a, b) => {
      const startDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      if (startDiff !== 0) return startDiff;
      
      const durationA = new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
      const durationB = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
      return durationB - durationA; // Longer events first
    });

    // Group overlapping events
    const columns: Event[][] = [];
    
    sortedEvents.forEach((event) => {
      const eventStart = new Date(event.startTime).getTime();
      const eventEnd = new Date(event.endTime).getTime();
      
      // Find a column where this event doesn't overlap with existing events
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const hasOverlap = column.some((existingEvent) => {
          const existingStart = new Date(existingEvent.startTime).getTime();
          const existingEnd = new Date(existingEvent.endTime).getTime();
          
          // Check if events overlap
          return eventStart < existingEnd && eventEnd > existingStart;
        });
        
        if (!hasOverlap) {
          column.push(event);
          placed = true;
          break;
        }
      }
      
      // If no suitable column found, create a new one
      if (!placed) {
        columns.push([event]);
      }
    });

    // Calculate width and left position for each event
    const totalColumns = columns.length;
    const eventLayout: Array<Event & { left: number; width: number }> = [];
    
    columns.forEach((column, columnIndex) => {
      column.forEach((event) => {
        eventLayout.push({
          ...event,
          left: (columnIndex / totalColumns) * 100, // Percentage
          width: (1 / totalColumns) * 100, // Percentage
        });
      });
    });

    return eventLayout;
  };

  /**
   * Format hour for display (e.g., "12:00 AM", "1:00 PM")
   */
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  /**
   * Get day name abbreviation (e.g., "Mon", "Tue")
   */
  const getDayName = (date: Date): string => {
    return formatDateForDisplay(date, 'EEE');
  };

  /**
   * Get day number (e.g., "18", "19")
   */
  const getDayNumber = (date: Date): string => {
    return formatDateForDisplay(date, 'd');
  };

  return (
    <div className="calendar-grid">
      {/* Header Row with Day Names and Dates */}
      <div className="calendar-grid-header">
        {/* Empty corner cell for time label column */}
        <div className="time-label-header"></div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`day-header ${isToday(day) ? 'today' : ''}`}
            data-is-today={isToday(day)}
          >
            <div className="day-name">{getDayName(day)}</div>
            <div className="day-number">{getDayNumber(day)}</div>
          </div>
        ))}
      </div>

      {/* Grid Body with Time Labels and Time Slots */}
      <div className="calendar-grid-body">
        {hours.map((hour) => (
          <div key={hour} className="calendar-grid-row">
            {/* Time label */}
            <div className="time-label">
              <span>{formatHour(hour)}</span>
            </div>

            {/* Time slots for each day */}
            {weekDays.map((day, dayIndex) => (
              <TimeSlot
                key={dayIndex}
                date={day}
                hour={hour}
                onClick={onTimeSlotClick}
              />
            ))}
          </div>
        ))}

        {/* Event blocks overlay - positioned absolutely over the grid */}
        <div className="events-overlay">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const eventsWithLayout = calculateEventLayout(dayEvents);

            return (
              <div
                key={dayIndex}
                className="day-events-container"
                style={{
                  gridColumn: dayIndex + 2, // +2 because first column is time labels
                }}
              >
                {eventsWithLayout.map((event) => (
                  <div
                    key={event._id}
                    className="event-wrapper"
                    style={{
                      left: `${event.left}%`,
                      width: `${event.width}%`,
                    }}
                  >
                    <EventBlock event={event} onClick={onEventClick} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
