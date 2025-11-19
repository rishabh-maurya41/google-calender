// Core Event Types

/**
 * Event interface matching the backend model
 * Represents a calendar event with all its properties
 */
export interface Event {
  _id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * EventInput interface for form data
 * Used when creating or updating events (without system-generated fields)
 */
export interface EventInput {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color: string;
}

/**
 * WeekRange interface for date calculations
 * Represents a week's start and end dates
 */
export interface WeekRange {
  start: Date;
  end: Date;
}

// API Response Types

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * API error response structure
 */
export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  statusCode: number;
}

/**
 * Response type for fetching multiple events
 */
export type GetEventsResponse = Event[];

/**
 * Response type for creating a single event
 */
export type CreateEventResponse = Event;

/**
 * Response type for updating a single event
 */
export type UpdateEventResponse = Event;

/**
 * Response type for deleting an event
 */
export interface DeleteEventResponse {
  message: string;
  eventId: string;
}

// Component Props Types

/**
 * Props for the WeekView component
 */
export interface WeekViewProps {
  initialDate?: Date;
}

/**
 * Props for the CalendarHeader component
 */
export interface CalendarHeaderProps {
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  loading?: boolean;
}

/**
 * Props for the CalendarGrid component
 */
export interface CalendarGridProps {
  weekStart: Date;
  events: Event[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: Event) => void;
}

/**
 * Props for the EventBlock component
 */
export interface EventBlockProps {
  event: Event;
  onClick: (event: Event) => void;
}

/**
 * Props for the EventModal component
 */
export interface EventModalProps {
  isOpen: boolean;
  event?: Event | null;
  initialDate?: Date;
  initialHour?: number;
  onClose: () => void;
  onSave: (event: EventInput) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

/**
 * Props for the TimeSlot component
 */
export interface TimeSlotProps {
  date: Date;
  hour: number;
  onClick: (date: Date, hour: number) => void;
}

/**
 * Props for the Notification component
 */
export interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

// Component State Types

/**
 * State for the WeekView component
 */
export interface WeekViewState {
  currentWeekStart: Date;
  events: Event[];
  loading: boolean;
  error: string | null;
}

/**
 * State for the EventModal component
 */
export interface EventModalState {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color: string;
  errors: EventFormErrors;
  isSubmitting: boolean;
}

/**
 * Form validation errors for event form
 */
export interface EventFormErrors {
  title?: string;
  startTime?: string;
  endTime?: string;
  general?: string;
}

// Utility Types

/**
 * Notification type enum
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Loading state type
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Day of week type (0 = Sunday, 6 = Saturday)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Hour of day type (0-23)
 */
export type HourOfDay = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

/**
 * Event position and dimensions for rendering
 */
export interface EventPosition {
  top: number;
  height: number;
  left: number;
  width: number;
}

/**
 * Notification item for notification queue
 */
export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

// Context Types (for state management)

/**
 * Calendar context state
 */
export interface CalendarContextState {
  events: Event[];
  currentWeekStart: Date;
  loading: boolean;
  error: string | null;
  notifications: NotificationItem[];
}

/**
 * Calendar context actions
 */
export interface CalendarContextActions {
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  setCurrentWeekStart: (date: Date) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  removeNotification: (id: string) => void;
}

/**
 * Combined calendar context type
 */
export interface CalendarContextType extends CalendarContextState, CalendarContextActions {}
