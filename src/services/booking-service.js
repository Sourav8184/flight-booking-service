const axios = require('axios');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { BookingRepository } = require('../repositories');
const db = require('../models');
const { ServerConfig } = require('../config');
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

module.exports = {
  createBooking,
};
