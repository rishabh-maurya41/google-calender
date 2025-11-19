import React, { useState, useEffect } from 'react';
import { EventModalProps, EventInput } from '../types';
import { useCalendar } from '../context/CalendarContext';
import Spinner from './Spinner';
import './EventModal.css';

/**
 * EventModal Component
 * 
 * A modal dialog for creating and editing calendar events.
 * Features:
 * - Modal dialog with backdrop
 * - Form with input fields (title, description, start time, end time)
 * - Color picker for event customization
 * - Responsive design centered on all screen sizes
 * - Open/close functionality
 * 
 * Requirements: 2.1, 2.2, 3.1, 3.2, 8.5
 */
const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  event,
  initialDate,
  initialHour,
  onClose,
  onSave,
  onDelete,
}) => {
  const { addNotification } = useCalendar();
  
  // Default color options for events
  const colorOptions = [
    '#3788d8', // Blue (default)
    '#e74c3c', // Red
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#e91e63', // Pink
    '#795548', // Brown
  ];

  // Initialize form state
  const getInitialFormState = (): EventInput => {
    if (event) {
      // Editing existing event
      return {
        title: event.title,
        description: event.description,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        color: event.color,
      };
    } else if (initialDate && initialHour !== undefined) {
      // Creating new event from time slot click
      const startTime = new Date(initialDate);
      startTime.setHours(initialHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(initialHour + 1, 0, 0, 0);
      
      return {
        title: '',
        description: '',
        startTime,
        endTime,
        color: colorOptions[0],
      };
    } else {
      // Default new event
      const now = new Date();
      const startTime = new Date(now);
      startTime.setMinutes(0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      
      return {
        title: '',
        description: '',
        startTime,
        endTime,
        color: colorOptions[0],
      };
    }
  };

  const [formData, setFormData] = useState<EventInput>(getInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  // Reset form when modal opens/closes or event changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormState());
      setErrors({});
    }
  }, [isOpen, event, initialDate, initialHour]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate title - required field
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Validate dates are valid
    if (!formData.startTime || isNaN(formData.startTime.getTime())) {
      newErrors.startTime = 'Invalid start time';
    }

    if (!formData.endTime || isNaN(formData.endTime.getTime())) {
      newErrors.endTime = 'Invalid end time';
    }

    // Validate that end time is after start time
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Validate event duration is reasonable (not more than 24 hours)
    if (formData.startTime && formData.endTime) {
      const durationInHours = (formData.endTime.getTime() - formData.startTime.getTime()) / (1000 * 60 * 60);
      if (durationInHours > 24) {
        newErrors.endTime = 'Event duration cannot exceed 24 hours';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle datetime input changes
  const handleDateTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: new Date(value),
    }));

    // Clear error for this field when user changes the value
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle color selection
  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color,
    }));
  };

  // Format date for datetime-local input
  const formatDateTimeForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Show notification for validation errors
      if (errors.title) {
        addNotification(errors.title, 'error');
      } else if (errors.endTime) {
        addNotification(errors.endTime, 'error');
      } else {
        addNotification('Please fix the validation errors', 'error');
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      // Modal will be closed by parent component after successful save
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete button click
  const handleDelete = async () => {
    if (!event || !onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(event._id);
      // Modal will be closed by parent component after successful deletion
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error deleting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="modal-loading-overlay">
            <Spinner size="medium" message={event ? 'Saving changes...' : 'Creating event...'} />
          </div>
        )}
        
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Event title"
              disabled={isSubmitting}
              className={errors.title ? 'error' : ''}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <span className="error-message" id="title-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Event description (optional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">
                Start Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formatDateTimeForInput(formData.startTime)}
                onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
                disabled={isSubmitting}
                className={errors.startTime ? 'error' : ''}
                aria-invalid={!!errors.startTime}
                aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              />
              {errors.startTime && (
                <span className="error-message" id="startTime-error" role="alert">
                  {errors.startTime}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">
                End Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formatDateTimeForInput(formData.endTime)}
                onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
                disabled={isSubmitting}
                className={errors.endTime ? 'error' : ''}
                aria-invalid={!!errors.endTime}
                aria-describedby={errors.endTime ? 'endTime-error' : undefined}
              />
              {errors.endTime && (
                <span className="error-message" id="endTime-error" role="alert">
                  {errors.endTime}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  disabled={isSubmitting}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            {event && onDelete && (
              <button
                type="button"
                className="button button-delete"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button
                type="button"
                className="button button-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {event ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
