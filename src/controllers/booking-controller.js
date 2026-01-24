const { BookingService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

/**
 * POST : /booking
 * req.body : { flightId: 123, userId: 345, totalSeats: 2 }
 */
const createBooking = async (req, res) => {
  try {
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.user.id,
      totalSeats: req.body.totalSeats,
    });
    SuccessResponse.data = booking;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /booking
 * Get all bookings for authenticated user
 * req.user : { id: 1, email, role }
 */
const getBookings = async (req, res) => {
  try {
    const bookings = await BookingService.getBookings({
      userId: req.user.id,
    });
    SuccessResponse.data = bookings;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /booking/:id
 * Get booking by ID (user can only view own booking)
 * req.params : { id: 1 }
 * req.user : { id: 1 }
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await BookingService.getBookingById({
      bookingId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });
    SuccessResponse.data = booking;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * DELETE : /booking/:id
 * Cancel booking (user can only cancel own booking)
 * Automatically refunds seats to flight
 * req.params : { id: 1 }
 * req.user : { id: 1, role }
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await BookingService.cancelBooking({
      bookingId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });
    SuccessResponse.data = booking;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

const makePayment = async (req, res) => {
  try {
    const bookingPayment = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      userId: req.body.userId,
      totalCost: req.body.totalCost,
    });
    SuccessResponse.data = bookingPayment;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  makePayment,
};
