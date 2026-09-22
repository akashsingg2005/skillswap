const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: [true, 'Booking must be associated with a Gig'],
  },
  clientName: {
    type: String,
    required: [true, 'Please provide client name'],
    trim: true,
  },
  clientEmail: {
    type: String,
    required: [true, 'Please provide client email'],
    trim: true,
    lowercase: true,
  },
  requirements: {
    type: String,
    required: [true, 'Please specify your requirements'],
  },
  preferredDate: {
    type: String,
    required: [true, 'Please select a preferred date'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined', 'Completed'],
    default: 'Pending',
  },
  declineReason: {
    type: String,
    default: '',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  paymentOrderId: {
    type: String,
    default: '',
  },
  paymentId: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  review: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
