import React from 'react';
import Notification from './Notification';
import { useCalendar } from '../context/CalendarContext';
import './NotificationContainer.css';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useCalendar();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container" aria-live="polite" aria-atomic="false">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
