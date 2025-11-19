import React from 'react';
import { EventBlockProps } from '../types';
import { calculateEventPosition, formatTimeForDisplay } from '../utils/dateUtils';
import './EventBlock.css';

/**
 * EventBlock Component
 * 
 * Renders an individual calendar event as a colored block with:
 * - Dynamic positioning based on start time
 * - Height proportional to event duration
 * - Event title and time range display
 * - User-selected color
 * - Click handler to open edit modal
 * - Hover effects for interactivity
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.5
 */
const EventBlock: React.FC<EventBlockProps> = ({ event, onClick }) => {
  // Calculate position and height based on event times
  const { top, height } = calculateEventPosition(
    event.startTime,
    event.endTime
  );

  // Format time range for display
  const startTime = formatTimeForDisplay(new Date(event.startTime));
  const endTime = formatTimeForDisplay(new Date(event.endTime));
  const timeRange = `${startTime} - ${endTime}`;

  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering time slot click
    onClick(event);
  };

  // Handle keyboard interaction for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      className="event-block"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: event.color,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title} from ${timeRange}`}
    >
      <div className="event-block-content">
        <div className="event-title">{event.title}</div>
        <div className="event-time">{timeRange}</div>
      </div>
    </div>
  );
};

export default EventBlock;
