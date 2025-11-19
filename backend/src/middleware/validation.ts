import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check validation results and return errors if any
 * Should be used after validation rules in route definitions
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    });
    return;
  }
  
  next();
};

/**
 * Custom validator to check if end time is after start time
 */
const isEndTimeAfterStartTime = (endTime: string, { req }: any): boolean => {
  const startTime = req.body.startTime;
  
  if (!startTime || !endTime) {
    return true; // Let required validators handle missing fields
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return true; // Let date validators handle invalid dates
  }
  
  return end > start;
};

/**
 * Custom validator to check if a value is a valid ISO 8601 date string
 */
const isValidDate = (value: string): boolean => {
  if (!value) {
    return true; // Let required validators handle missing fields
  }
  
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Validation rules for creating a new event
 * All fields are required except description and color
 */
export const validateEventCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .custom(isValidDate)
    .withMessage('Start time must be a valid date'),
  
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .custom(isValidDate)
    .withMessage('End time must be a valid date')
    .custom(isEndTimeAfterStartTime)
    .withMessage('End time must be after start time'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #3788d8)'),
  
  handleValidationErrors,
];

/**
 * Validation rules for updating an existing event
 * All fields are optional, but if provided must be valid
 */
export const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('startTime')
    .optional()
    .custom(isValidDate)
    .withMessage('Start time must be a valid date'),
  
  body('endTime')
    .optional()
    .custom(isValidDate)
    .withMessage('End time must be a valid date')
    .custom((endTime: string, { req }: any) => {
      // Only validate end time vs start time if both are provided
      if (req.body.startTime && endTime) {
        return isEndTimeAfterStartTime(endTime, { req });
      }
      return true;
    })
    .withMessage('End time must be after start time'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #3788d8)'),
  
  handleValidationErrors,
];
