const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const { ErrorResponse } = require('../utils/common');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

/**
 * Verify JWT Token
 * Calls centralized Auth Service to verify token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // ✅ Token priority: Header first, then Body
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.body?.token;

    if (!token) {
      ErrorResponse.error = 'Token not provided (Header or Body)';
      return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
    }

    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/verify-token`, { token });

    req.user = response.data.data;
    next();
  } catch (error) {
    ErrorResponse.error = error.response?.data?.message || 'Token verification failed';
    return res.status(error.response?.status || StatusCodes.UNAUTHORIZED).json(ErrorResponse);
  }
};

/**
 * Check if user has specific role
 * Validates permissions with centralized Auth Service
 */
const authorizeRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user role is in allowed roles
      if (!req.user) {
        ErrorResponse.error = 'User not authenticated';
        return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
      }

      if (!allowedRoles.includes(req.user.role)) {
        ErrorResponse.error = 'Insufficient permissions';
        return res.status(StatusCodes.FORBIDDEN).json(ErrorResponse);
      }

      next();
    } catch (error) {
      ErrorResponse.error = error.message || 'Authorization check failed';
      return res.status(StatusCodes.FORBIDDEN).json(ErrorResponse);
    }
  };
};

module.exports = {
  verifyToken,
  authorizeRole,
};
