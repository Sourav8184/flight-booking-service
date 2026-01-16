const cron = require('node-cron');
const { BookingService } = require('../../services');
const AppError = require('../errors/app-error');
const { StatusCodes } = require('http-status-codes');

function someScheduledTask() {
  cron.schedule('*/30 * * * *', async () => {
    try {
      await BookingService.cancelOldBookings();
    } catch (err) {
      throw new AppError('Error in cancelling old bookings', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  });
}

module.exports = {
  someScheduledTask,
};
