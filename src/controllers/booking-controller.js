const { BookingService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse } = require('../utils/common');

/**
 * POST : /booking
 * req.body : { flightId: 123, userId: 345, totalSeats: 2 }
 */
const createBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.user.id,
      totalSeats: req.body.totalSeats,
    });
    return res
      .status(StatusCodes.CREATED)
      .json(new SuccessResponse(booking, 'Booking created successfully', StatusCodes.CREATED));
  } catch (error) {
    next(error);
  }
};

/**
 * GET : /booking
 * Get all bookings for authenticated user
 * req.user : { id: 1, email, role }
 */
const getBookings = async (req, res, next) => {
  try {
    const bookings = await BookingService.getBookings({
      userId: req.user.id,
    });
    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(bookings, 'Bookings retrieved successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * GET : /booking/:id
 * Get booking by ID (user can only view own booking)
 * req.params : { id: 1 }
 * req.user : { id: 1 }
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await BookingService.getBookingById({
      bookingId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });
    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(booking, 'Booking retrieved successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE : /booking/:id
 * Cancel booking (user can only cancel own booking)
 * Automatically refunds seats to flight
 * req.params : { id: 1 }
 * req.user : { id: 1, role }
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.cancelBooking({
      bookingId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });
    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(booking, 'Booking cancelled successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

const makePayment = async (req, res, next) => {
  try {
    const bookingPayment = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      userId: req.body.userId,
      totalCost: req.body.totalCost,
    });
    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(bookingPayment, 'Payment successful', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  makePayment,
};
