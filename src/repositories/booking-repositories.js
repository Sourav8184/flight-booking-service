const CrudRepository = require('./crud-repositories');
const { Booking } = require('../models');

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
}

module.exports = BookingRepository;
