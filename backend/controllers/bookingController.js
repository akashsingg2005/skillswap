const Booking = require('../models/Booking');
const Gig = require('../models/Gig');

exports.createBooking = async (req, res) => {
  try {
    const { gigId, clientName, clientEmail, requirements, preferredDate } = req.body;

    if (!gigId || !clientName || !clientEmail || !requirements || !preferredDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    const existingAccepted = await Booking.findOne({ gigId, status: 'Accepted' });
    if (existingAccepted) {
      return res.status(409).json({
        success: false,
        message: 'This creator gig has already accepted a booking and is currently unavailable.',
      });
    }

    const booking = await Booking.create({
      gigId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      requirements: requirements.trim(),
      preferredDate,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    const populatedBooking = await Booking.findById(booking._id).populate('gigId').lean();

    return res.status(201).json({
      success: true,
      message: 'Booking request placed successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating booking',
      error: error.message,
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { email, gigId } = req.query;
    let filter = {};

    if (email) {
      filter.clientEmail = email.trim().toLowerCase();
    }
    if (gigId) {
      filter.gigId = gigId;
    }

    const bookings = await Booking.find(filter)
      .populate('gigId')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching bookings',
      error: error.message,
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('gigId').lean();
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching booking',
      error: error.message,
    });
  }
};

// Accept Booking (DP2 Double Booking Guard)
exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'Accepted') {
      const populated = await Booking.findById(bookingId).populate('gigId').lean();
      return res.status(200).json({
        success: true,
        message: 'Booking is already accepted',
        data: populated,
      });
    }

    // DP2 Guard: Check if another booking for the exact same gig is ALREADY Accepted
    const existingAccepted = await Booking.findOne({
      gigId: booking.gigId,
      status: 'Accepted',
      _id: { $ne: bookingId }
    });

    if (existingAccepted) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: This gig has already accepted another booking request. Cannot accept multiple bookings.',
      });
    }

    booking.status = 'Accepted';
    booking.declineReason = '';
    await booking.save();

    // DP2 Auto-Sweep
    await Booking.updateMany(
      {
        gigId: booking.gigId,
        _id: { $ne: bookingId },
        status: 'Pending'
      },
      {
        $set: {
          status: 'Declined',
          declineReason: 'Creator accepted another client booking for this gig schedule.'
        }
      }
    );

    const updatedBooking = await Booking.findById(bookingId).populate('gigId').lean();

    return res.status(200).json({
      success: true,
      message: 'Booking accepted! Other pending requests for this gig have been automatically declined (DP2 Double-Booking Enforced).',
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error accepting booking',
      error: error.message,
    });
  }
};

// Decline Booking (DP1 Rejection)
exports.declineBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = 'Declined';
    booking.declineReason = reason || 'The creator is currently unavailable for your requested schedule.';
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId).populate('gigId').lean();

    return res.status(200).json({
      success: true,
      message: 'Booking declined.',
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error declining booking',
      error: error.message,
    });
  }
};

// Complete & Deliver Booking (Unlocks Gig for New Bookings)
exports.completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = 'Completed';
    await booking.save();

    if (booking.gigId) {
      try {
        await Gig.findByIdAndUpdate(booking.gigId, { $inc: { completedProjects: 1 } });
      } catch (gErr) {
        console.warn('Could not increment gig completedProjects:', gErr.message);
      }
    }

    const updatedBooking = await Booking.findById(bookingId).populate('gigId').lean();

    return res.status(200).json({
      success: true,
      message: 'Booking marked as Completed & Delivered! This creator service is now open for new client bookings.',
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error completing booking',
      error: error.message,
    });
  }
};

// Rate Booking (Client Rating & Review after Completion)
exports.rateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { rating, review } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5 stars.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Rating can only be submitted for completed bookings.',
      });
    }

    booking.rating = numRating;
    booking.review = review ? review.trim() : '';
    await booking.save();

    // Update Gig rating average & reviews count
    if (booking.gigId) {
      try {
        const gig = await Gig.findById(booking.gigId);
        if (gig) {
          const newReviewsCount = (gig.reviewsCount || 0) + 1;
          const currentTotal = (gig.rating || 5.0) * (gig.reviewsCount || 1);
          const newAvgRating = Math.round(((currentTotal + numRating) / newReviewsCount) * 10) / 10;

          gig.reviewsCount = newReviewsCount;
          gig.rating = Math.min(5.0, Math.max(1.0, newAvgRating));
          await gig.save();
        }
      } catch (gErr) {
        console.warn('Could not update gig rating:', gErr.message);
      }
    }

    const updatedBooking = await Booking.findById(bookingId).populate('gigId').lean();

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your rating and review have been recorded.',
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error rating booking',
      error: error.message,
    });
  }
};
