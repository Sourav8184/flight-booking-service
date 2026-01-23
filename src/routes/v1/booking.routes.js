const { BookingController } = require('../../controllers');
const { verifyToken } = require('../../middlewares/auth-middleware');
const express = require('express');
const router = express.Router();

// All booking routes require authentication (user level)

// Create new booking
router.post('/', verifyToken, BookingController.createBooking);

// Get all bookings for authenticated user
router.get('/', verifyToken, BookingController.getBookings);

// Get booking by ID (user can only view own booking)
router.get('/:id', verifyToken, BookingController.getBookingById);

// Cancel booking
router.delete('/:id', verifyToken, BookingController.cancelBooking);

// Make payment for booking
router.post('/:id/payment', verifyToken, BookingController.makePayment);

module.exports = router;
