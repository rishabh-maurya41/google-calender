# API Service Layer

This directory contains the API service layer for communicating with the backend.

## Configuration

The API client is configured to use the base URL from the environment variable `VITE_API_BASE_URL` or defaults to `http://localhost:5000`.

To configure the API URL, create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Usage

### Import the API functions

```typescript
import { getEvents, createEvent, updateEvent, deleteEvent } from './services';
```

### Get Events

Fetch events within a date range:

```typescript
try {
  const events = await getEvents('2024-01-01T00:00:00Z', '2024-01-07T23:59:59Z');
  console.log('Events:', events);
} catch (error) {
  console.error('Failed to fetch events:', error);
}
```

### Create Event

Create a new event:

```typescript
try {
  const newEvent = await createEvent({
    title: 'Team Meeting',
    description: 'Weekly sync with the team',
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-15T11:00:00'),
    color: '#3788d8',
  });
  console.log('Created event:', newEvent);
} catch (error) {
  console.error('Failed to create event:', error);
}
```

### Update Event

Update an existing event:

```typescript
try {
  const updatedEvent = await updateEvent('event-id-123', {
    title: 'Updated Team Meeting',
    startTime: new Date('2024-01-15T14:00:00'),
    endTime: new Date('2024-01-15T15:00:00'),
  });
  console.log('Updated event:', updatedEvent);
} catch (error) {
  console.error('Failed to update event:', error);
}
```

### Delete Event

Delete an event:

```typescript
try {
  const result = await deleteEvent('event-id-123');
  console.log('Delete result:', result);
} catch (error) {
  console.error('Failed to delete event:', error);
}
```

## Error Handling

All API functions throw errors that conform to the `ApiError` interface:

```typescript
interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  statusCode: number;
}
```

Example error handling:

```typescript
import { createEvent } from './services';
import { ApiError } from './types';

try {
  await createEvent(eventData);
} catch (error) {
  const apiError = error as ApiError;
  
  if (apiError.statusCode === 400) {
    // Validation error
    console.error('Validation failed:', apiError.details);
  } else if (apiError.statusCode === 0) {
    // Network error
    console.error('Network error:', apiError.error);
  } else {
    // Other errors
    console.error('Error:', apiError.error);
  }
}
```

## Features

- **Automatic date transformation**: All date strings from the API are automatically converted to JavaScript Date objects
- **Error handling**: Consistent error format across all API calls
- **Request timeout**: 10-second timeout for all requests
- **Network error handling**: Graceful handling of network failures
- **Type safety**: Full TypeScript support with proper types for all functions
