const { StatusCodes } = require('http-status-codes');

/**
 * Global Error Handling Middleware
 * Catches all errors and sends proper error responses to client
 */
const errorHandler = (err, req, res, next) => {
  // Default error object
  let error = {
    success: false,
    message: 'Something went wrong',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    data: {},
  };

  // Handle custom errors with statusCode
  if (err.statusCode) {
    error.message = err.message || error.message;
    error.statusCode = err.statusCode;
  }
  // Handle Sequelize Validation Error
  else if (err.name === 'SequelizeValidationError') {
    error.message = 'Validation Error';
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.data = err.errors?.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle Sequelize Unique Constraint Error
  else if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Unique Constraint Violation';
    error.statusCode = StatusCodes.CONFLICT;
    error.data = err.errors?.map((e) => ({
      field: e.path,
      message: `${e.path} already exists`,
    }));
  }
  // Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid or malformed token';
    error.statusCode = StatusCodes.UNAUTHORIZED;
  } else if (err.name === 'TokenExpiredError') {
    error.message = 'Token has expired';
    error.statusCode = StatusCodes.UNAUTHORIZED;
  }
  // Handle other standard errors
  else if (err instanceof Error) {
    error.message = err.message || 'Something went wrong';
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  // Send error response
  res.status(error.statusCode).json(error);
};

/**
 * Handle 404 Not Found
 */
const notFoundHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: StatusCodes.NOT_FOUND,
    data: {},
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
