import { Schema, model, Document } from 'mongoose';

/**
 * TypeScript interface for Event document
 * Extends Mongoose Document to include MongoDB document properties
 */
export interface IEvent extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Event
 * Defines structure, validation rules, and default values
 */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (this: IEvent, value: Date): boolean {
          // If startTime is not set, allow validation to pass (startTime is required separately)
          if (!this.startTime) {
            return true;
          }
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    color: {
      type: String,
      default: '#3788d8',
      trim: true,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Database Indexes for Performance Optimization
 * 
 * Compound index on startTime and endTime:
 * - Optimizes range queries that filter by both time fields
 * - Supports queries like: { startTime: { $lte: date }, endTime: { $gte: date } }
 * - Also supports sorting by startTime
 * 
 * Individual indexes:
 * - startTime: Optimizes queries that only filter/sort by start time
 * - endTime: Optimizes queries that only filter by end time
 */
EventSchema.index({ startTime: 1, endTime: 1 }); // Compound index for range queries
EventSchema.index({ startTime: 1 }); // Individual index for start time queries and sorting
EventSchema.index({ endTime: 1 }); // Individual index for end time queries

/**
 * Event model for MongoDB operations
 * Export for use in controllers and services
 */
export const Event = model<IEvent>('Event', EventSchema);
