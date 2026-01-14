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
}

module.exports = BookingRepository;
