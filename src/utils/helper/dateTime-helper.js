const AppError = require('../errors/app-error');
const { StatusCodes } = require('http-status-codes');

function validateFlightTimes(departureTime, arrivalTime) {
  const departure = new Date(departureTime).getTime();
  const arrival = new Date(arrivalTime).getTime();

  if (isNaN(departure) || isNaN(arrival)) {
    throw new AppError('Invalid departure or arrival time format', StatusCodes.BAD_REQUEST);
  }

  if (departure > arrival) {
    throw new AppError('Departure time must be earlier than arrival time', StatusCodes.BAD_REQUEST);
  }
}

module.exports = {
  validateFlightTimes,
};
