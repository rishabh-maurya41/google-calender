import React from 'react';
import { CalendarHeaderProps } from '../types';
import { formatDateRange, getWeekEnd } from '../utils/dateUtils';
import './CalendarHeader.css';

/**
 * CalendarHeader Component
 * 
 * Displays the current week date range and provides navigation controls
 * for moving between weeks (Previous, Today, Next buttons).
 * 
 * Requirements: 1.3, 1.4, 5.1, 5.2, 5.3, 5.4
 */
const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onToday,
  loading = false,
}) => {
  const weekEnd = getWeekEnd(weekStart);
  const dateRangeText = formatDateRange(weekStart, weekEnd);
  
  // Check if the current week contains today
  const isCurrentWeek = () => {
    const today = new Date();
    return today >= weekStart && today <= weekEnd;
  };

  return (
    <header className="calendar-header">
      <div className="calendar-header-content">
        <div className="calendar-header-title">
          <h2 className="week-range">{dateRangeText}</h2>
        </div>
        
        <nav className="calendar-header-nav">
          <button
            className="nav-button nav-button-prev"
            onClick={onPreviousWeek}
            aria-label="Previous week"
            title="Previous week"
            disabled={loading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="nav-button-text">Previous</span>
          </button>
          
          <button
            className={`nav-button nav-button-today ${isCurrentWeek() ? 'current-week' : ''}`}
            onClick={onToday}
            aria-label="Go to today"
            title="Go to today"
            disabled={isCurrentWeek() || loading}
          >
            Today
          </button>
          
          <button
            className="nav-button nav-button-next"
            onClick={onNextWeek}
            aria-label="Next week"
            title="Next week"
            disabled={loading}
          >
            <span className="nav-button-text">Next</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default CalendarHeader;
