import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const expenseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  handleValidationErrors,
];

export const incomeValidation = [
  body('source').trim().notEmpty().withMessage('Source is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  handleValidationErrors,
];

export const budgetValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be 1-12'),
  body('year').isInt({ min: 2020 }).withMessage('Valid year required'),
  body('limit').isFloat({ min: 1 }).withMessage('Budget limit must be positive'),
  handleValidationErrors,
];
