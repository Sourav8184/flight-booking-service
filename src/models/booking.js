'use strict';
const { Model } = require('sequelize');
const { ENUMS } = require('../utils/common');
const { CANCELLED, CONFIRMED, INITIAL, PENDING } = ENUMS.BOOKING_STATUS;
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init(
    {
      flightId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: [INITIAL, PENDING, CONFIRMED, CANCELLED],
        allowNull: false,
        defaultValue: INITIAL,
      },
      totalCost: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'Booking',
    },
  );
  return Booking;
};
