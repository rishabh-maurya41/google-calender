# Validation Middleware

This directory contains validation middleware for the Calendar API using `express-validator`.

## Overview

The validation middleware provides comprehensive input validation for event creation and updates, ensuring data integrity before it reaches the database layer.

## Files

- `validation.ts` - Contains validation rules and error handling middleware

## Usage

### Event Creation Validation

Use `validateEventCreation` middleware for POST requests to create new events:

```typescript
import { validateEventCreation } from './middleware/validation';

router.post('/api/events', validateEventCreation, createEventController);
```

**Validation Rules:**
- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters
- `startTime`: Required, must be a valid date
- `endTime`: Required, must be a valid date, must be after startTime
- `color`: Optional, must be a valid hex color code (e.g., #3788d8)

### Event Update Validation

Use `validateEventUpdate` middleware for PUT requests to update existing events:

```typescript
import { validateEventUpdate } from './middleware/validation';

router.put('/api/events/:id', validateEventUpdate, updateEventController);
```

**Validation Rules:**
- All fields are optional
- If provided, fields must meet the same criteria as creation
- `endTime` is validated against `startTime` only if both are provided in the update

## Error Response Format

When validation fails, the middleware returns a 400 status code with the following JSON structure:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "endTime",
      "message": "End time must be after start time"
    }
  ]
}
```

## Custom Validators

### isValidDate
Checks if a string can be parsed into a valid JavaScript Date object.

### isEndTimeAfterStartTime
Validates that the `endTime` is chronologically after the `startTime`. This validator:
- Only runs if both dates are present
- Allows other validators to handle missing or invalid dates first
- Compares the actual Date objects, not just the string values

## Requirements Satisfied

This middleware satisfies the following requirements:
- **2.4**: Validates that end time is after start time during event creation
- **3.4**: Validates that updated end time is after updated start time during event editing
- **10.2**: Displays field-specific validation errors when user submits invalid event data

## Example Validation Scenarios

### Valid Event Creation
```json
{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "color": "#3788d8"
}
```
✅ Passes validation

### Invalid Event Creation - Missing Title
```json
{
  "description": "Weekly sync",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z"
}
```
❌ Returns: `{ "field": "title", "message": "Title is required" }`

### Invalid Event Creation - End Time Before Start Time
```json
{
  "title": "Team Meeting",
  "startTime": "2024-01-15T11:00:00Z",
  "endTime": "2024-01-15T10:00:00Z"
}
```
❌ Returns: `{ "field": "endTime", "message": "End time must be after start time" }`

### Invalid Event Creation - Invalid Color
```json
{
  "title": "Team Meeting",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "color": "blue"
}
```
❌ Returns: `{ "field": "color", "message": "Color must be a valid hex color code (e.g., #3788d8)" }`

### Valid Event Update - Partial Update
```json
{
  "title": "Updated Meeting Title"
}
```
✅ Passes validation (only updates title, other fields remain unchanged)

### Invalid Event Update - Invalid Date
```json
{
  "startTime": "not-a-date"
}
```
❌ Returns: `{ "field": "startTime", "message": "Start time must be a valid date" }`
