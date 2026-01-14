const express = require('express');
const { InfoController } = require('../../controllers');
const BookingRouter = require('./booking.routes');
const router = express.Router();

router.get('/info', InfoController.info);
router.use('/booking', BookingRouter);

module.exports = router;
