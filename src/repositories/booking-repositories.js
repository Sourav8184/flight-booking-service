const CrudRepository = require('./crud-repositories');
const { Booking } = require('../models');

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data, transaction) {
    const response = await this.model.create(data, { transaction: transaction });
    return response;
  }

  async getBookingDetails(data, transaction) {
    const response = await this.model.findByPk(data.bookingId, { transaction: transaction });
    if (!response) {
      throw new AppError('Data not found from the given id', StatusCodes.NOT_FOUND);
    }
    return response;
  }

  async updateBookingDetails(id, data, transaction) {
    const response = await this.model.update(
      data,
      {
        where: { id },
      },
      {
        transaction: transaction,
      },
    );

    if (!response[0]) {
      throw new AppError('Data not found from the given id', StatusCodes.NOT_FOUND);
    }

    return response;
  }
}

module.exports = BookingRepository;
