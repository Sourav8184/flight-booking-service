const axios = require('axios');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { BookingRepository } = require('../repositories');
const db = require('../models');
const { ServerConfig } = require('../config');
const { ENUMS } = require('../utils/common');
const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    // get the flight details
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`,
    );

    // extract flight data
    const flightData = flight.data.data;

    // check for seat availability
    if (data.totalSeats > flightData.totalSeats) {
      throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
    }

    // calculate the total amount
    const totalBillingAmount = data.totalSeats * flightData.price;

    // prepare the booking payload
    const bookingPayload = {
      ...data,
      totalCost: totalBillingAmount,
    };

    // create the booking
    const booking = await bookingRepository.createBooking(bookingPayload, transaction);

    // decrement the seats in flight service
    await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
      seats: data.totalSeats,
      dec: true,
    });

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Cannot book a flights', StatusCodes.BAD_REQUEST);
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetail = await bookingRepository.getBookingDetails(data, transaction);

    if (bookingDetail.status === ENUMS.BOOKING_STATUS.CANCELLED) {
      throw new AppError('Booking is already cancelled', StatusCodes.BAD_REQUEST);
    }

    if (bookingDetail.status === ENUMS.BOOKING_STATUS.CONFIRMED) {
      throw new AppError('Booking is already confirmed', StatusCodes.BAD_REQUEST);
    }

    const bookingTime = new Date(bookingDetail.createdAt);
    const currentTime = new Date();

    const timeDiff = (currentTime - bookingTime) / (1000 * 60); // time difference in minutes

    if (timeDiff > 20) {
      await cancelBooking(data.bookingId);
      throw new AppError('Booking Expired', StatusCodes.BAD_REQUEST);
    }

    if (Number(bookingDetail.totalCost) !== Number(data.totalCost)) {
      throw new AppError('Invalid payment amount', StatusCodes.BAD_REQUEST);
    }

    if (Number(bookingDetail.userId) !== Number(data.userId)) {
      throw new AppError('Invalid userId', StatusCodes.BAD_REQUEST);
    }

    // assume payment is successful
    const updatedBooking = await bookingRepository.updateBookingDetails(
      data.bookingId,
      { status: ENUMS.BOOKING_STATUS.CONFIRMED },
      transaction,
    );

    await transaction.commit();
    return updatedBooking;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Payment Failed', StatusCodes.BAD_REQUEST);
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetail = await bookingRepository.getBookingDetails({ bookingId }, transaction);

    if (!bookingDetail) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // if already cancelled, return
    if (bookingDetail.status === ENUMS.BOOKING_STATUS.CANCELLED) {
      await transaction.commit();
      throw new AppError('Booking is already cancelled', StatusCodes.BAD_REQUEST);
    }

    // increment the seats in flight service
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetail.flightId}/seats`,
      {
        seats: bookingDetail.totalSeats,
        dec: false,
      },
    );

    // update the booking status to cancelled
    const updatedBooking = await bookingRepository.updateBookingDetails(
      bookingId,
      { status: ENUMS.BOOKING_STATUS.CANCELLED },
      transaction,
    );

    await transaction.commit();
    return updatedBooking;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Cannot cancel booking', StatusCodes.BAD_REQUEST);
  }
}

async function cancelOldBookings() {
  try {
    // ✅ bookings older than 5 minutes
    const time = new Date(Date.now() - 5 * 60 * 1000);
    await bookingRepository.cancelOldBookings(time);
  } catch (error) {
    throw new AppError('Error in cancelling old bookings', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getBookings(data) {
  try {
    const bookings = await bookingRepository.getByFilter({
      where: { userId: data.userId },
      order: [['createdAt', 'DESC']],
    });

    if (!bookings || bookings.length === 0) {
      return [];
    }

    return bookings;
  } catch (error) {
    throw new AppError('Cannot fetch bookings', StatusCodes.BAD_REQUEST);
  }
}

async function getBookingById(data) {
  try {
    const booking = await bookingRepository.get(data.bookingId);

    if (!booking) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // Check if booking belongs to the user
    if (booking.userId !== Number(data.userId)) {
      throw new AppError('You can only view your own bookings', StatusCodes.FORBIDDEN);
    }

    return booking;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Cannot fetch booking details', StatusCodes.BAD_REQUEST);
  }
}

async function updateBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const booking = await bookingRepository.get(data.bookingId);

    if (!booking) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }

    // Check if booking belongs to the user
    if (booking.userId !== Number(data.userId)) {
      throw new AppError('You can only update your own bookings', StatusCodes.FORBIDDEN);
    }

    // Only allow updating status
    if (!data.status) {
      throw new AppError('Status is required', StatusCodes.BAD_REQUEST);
    }

    // Validate status value
    const validStatuses = Object.values(ENUMS.BOOKING_STATUS);
    if (!validStatuses.includes(data.status)) {
      throw new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        StatusCodes.BAD_REQUEST,
      );
    }

    // Prevent downgrading from confirmed status
    if (
      booking.status === ENUMS.BOOKING_STATUS.CONFIRMED &&
      data.status !== ENUMS.BOOKING_STATUS.CONFIRMED
    ) {
      throw new AppError('Cannot update a confirmed booking', StatusCodes.BAD_REQUEST);
    }

    // Update booking status
    const updatedBooking = await bookingRepository.updateBookingDetails(
      data.bookingId,
      { status: data.status },
      transaction,
    );

    await transaction.commit();
    return updatedBooking;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Cannot update booking', StatusCodes.BAD_REQUEST);
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  makePayment,
  cancelOldBookings,
};
