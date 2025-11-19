import React from 'react';
import { TimeSlotProps } from '../types';
import { isToday, isCurrentTimeSlot } from '../utils/dateUtils';
import './TimeSlot.css';

/**
 * TimeSlot Component
 * 
 * Represents a single hour slot in the calendar grid.
 * Provides clickable cells for event creation with hover effects.
 * Highlights current day column and current time slot.
 * 
 * Requirements: 2.1, 9.5, 1.3
 */
const TimeSlot: React.FC<TimeSlotProps> = ({ date, hour, onClick }) => {
  /**
   * Handle click event on time slot
   */
  const handleClick = () => {
    onClick(date, hour);
  };

  /**
   * Determine if this time slot is in today's column
   */
  const isTodayColumn = isToday(date);

  /**
   * Determine if this is the current time slot (today + current hour)
   */
  const isCurrentSlot = isCurrentTimeSlot(date, hour);

  return (
    <div
      className={`time-slot ${isTodayColumn ? 'today-column' : ''} ${isCurrentSlot ? 'current-time-slot' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Create event on ${date.toLocaleDateString()} at ${hour}:00`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Current time indicator line */}
      {isCurrentSlot && (
        <div className="current-time-indicator" aria-hidden="true">
          <div className="current-time-line"></div>
        </div>
      )}
    </div>
  );
};

export default TimeSlot;
