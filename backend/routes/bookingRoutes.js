const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  acceptBooking,
  declineBooking,
  completeBooking,
  rateBooking,
} = require('../controllers/bookingController');

router.route('/')
  .post(createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBookingById);

router.patch('/:id/accept', acceptBooking);
router.patch('/:id/decline', declineBooking);
router.patch('/:id/complete', completeBooking);
router.patch('/:id/rate', rateBooking);

module.exports = router;
