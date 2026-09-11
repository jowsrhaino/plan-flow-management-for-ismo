const { body, validationResult } = require('express-validator');

// பொதுவான Validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Register & Login Validation
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Project Validation (புதியது)
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project Name is required'),
  body('status').optional().isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid project status'),
  body('startDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid start date format'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid end date format'),
  validate
];

// Task Validation (புதியது)
const taskValidation = [
  body('projectId').isInt({ min: 1 }).withMessage('Valid Project ID is required'),
  body('name').trim().notEmpty().withMessage('Task Name is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid task status'),
  body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid due date format'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  projectValidation,
  taskValidation
};