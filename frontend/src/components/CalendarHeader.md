# CalendarHeader Component

## Overview
The CalendarHeader component displays the current week's date range and provides navigation controls for moving between weeks.

## Features Implemented

### ✅ Week Navigation Buttons
- **Previous Week**: Navigate to the previous week
- **Today**: Jump back to the current week (disabled when already on current week)
- **Next Week**: Navigate to the next week

### ✅ Current Week Date Range Display
- Shows formatted date range (e.g., "Dec 18 - 24, 2023")
- Automatically updates when navigating between weeks
- Handles month transitions gracefully

### ✅ Click Handlers
- `onPreviousWeek`: Triggered when Previous button is clicked
- `onNextWeek`: Triggered when Next button is clicked
- `onToday`: Triggered when Today button is clicked

### ✅ Responsive Design
- **Desktop (≥1024px)**: Full layout with button text and icons
- **Tablet (768px - 1023px)**: Optimized spacing
- **Mobile (<768px)**: Stacked layout, icon-only navigation buttons
- **Small Mobile (<480px)**: Compact design with smaller text and buttons

### ✅ Current Day Highlighting Logic
- Today button is disabled and visually distinct when viewing the current week
- Uses `isCurrentWeek()` helper to determine if the displayed week contains today

## Requirements Satisfied

- **Requirement 1.3**: Highlights current day with distinct visual indicator (Today button styling)
- **Requirement 1.4**: Displays current week's date range in header
- **Requirement 5.1**: Displays previous week and next week navigation buttons
- **Requirement 5.2**: Loads previous week when Previous button clicked
- **Requirement 5.3**: Loads next week when Next button clicked
- **Requirement 5.4**: Displays "Today" button that returns to current week

## Usage Example

```tsx
import { CalendarHeader } from './components';
import { useCalendar } from './context';

function MyCalendar() {
  const {
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  } = useCalendar();

  return (
    <CalendarHeader
      weekStart={currentWeekStart}
      onPreviousWeek={goToPreviousWeek}
      onNextWeek={goToNextWeek}
      onToday={goToToday}
    />
  );
}
```

## Props Interface

```typescript
interface CalendarHeaderProps {
  weekStart: Date;           // The Monday of the current week
  onPreviousWeek: () => void; // Handler for previous week navigation
  onNextWeek: () => void;     // Handler for next week navigation
  onToday: () => void;        // Handler for today navigation
}
```

## Styling

The component includes comprehensive CSS with:
- Clean, modern design matching Google Calendar aesthetic
- Smooth transitions and hover effects
- Focus states for accessibility
- Print-friendly styles (hides navigation in print view)
- Responsive breakpoints for all screen sizes

## Accessibility

- Proper ARIA labels for all buttons
- Keyboard navigation support
- Focus indicators for keyboard users
- Disabled state for Today button when on current week
- Semantic HTML structure
