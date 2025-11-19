# Calendar Context - State Management

This directory contains the global state management for the Calendar Application using React Context API.

## Overview

The `CalendarContext` provides centralized state management for:
- Events array
- Current week navigation
- Loading and error states
- Modal visibility and selected event
- Notifications

## Usage

### Wrap your app with CalendarProvider

```tsx
import { CalendarProvider } from './context';

function App() {
  return (
    <CalendarProvider>
      {/* Your app components */}
    </CalendarProvider>
  );
}
```

### Use the useCalendar hook in components

```tsx
import { useCalendar } from './context';

function MyComponent() {
  const {
    events,
    loading,
    currentWeekStart,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    goToNextWeek,
    goToPreviousWeek,
    goToToday,
    openModal,
    closeModal,
    notifications,
    addNotification,
    removeNotification,
  } = useCalendar();

  // Use the state and actions
}
```

## State Structure

```typescript
interface CalendarState {
  // Events
  events: Event[];
  
  // Current week
  currentWeekStart: Date;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Modal state
  modal: {
    isOpen: boolean;
    event: Event | null;
    initialDate?: Date;
    initialHour?: number;
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
}
```

## Available Actions

### Event Actions
- `fetchEvents(startDate: Date, endDate: Date)` - Fetch events for a date range
- `createEvent(eventInput: EventInput)` - Create a new event
- `updateEvent(id: string, eventInput: Partial<EventInput>)` - Update an existing event
- `deleteEvent(id: string)` - Delete an event

### Week Navigation Actions
- `setCurrentWeekStart(date: Date)` - Set the current week to a specific date
- `goToPreviousWeek()` - Navigate to the previous week
- `goToNextWeek()` - Navigate to the next week
- `goToToday()` - Navigate to the current week

### Modal Actions
- `openModal(event?, initialDate?, initialHour?)` - Open the event modal
- `closeModal()` - Close the event modal

### Notification Actions
- `addNotification(message: string, type: 'success' | 'error' | 'info')` - Add a notification
- `removeNotification(id: string)` - Remove a notification

### Error Handling
- `clearError()` - Clear the current error state

## Features

### Automatic Notifications
- Success notifications are automatically shown after successful create/update/delete operations
- Error notifications are automatically shown when operations fail
- Notifications auto-dismiss after 5 seconds

### Loading States
- The `loading` state is automatically managed during async operations
- Components can use this to show loading indicators

### Error Handling
- Errors are caught and stored in the `error` state
- Error messages are also shown as notifications
- Use `clearError()` to manually clear errors

## Requirements Satisfied

This state management implementation satisfies the following requirements:
- 1.5: Fetch and display events for the current week
- 2.3, 2.5: Create events and refresh the view
- 3.3, 3.5: Update events and refresh the view
- 4.4: Delete events and refresh the view
- 5.2, 5.3: Navigate between weeks
- 9.2, 9.3: Display notifications for user feedback
