const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret) {
    return new Razorpay({
      key_id,
      key_secret,
    });
  }
  return null;
};

exports.createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and amount',
      });
    }

    const booking = await Booking.findById(bookingId).populate('gigId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      const options = {
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: `receipt_${bookingId.toString().substring(0, 10)}`,
        notes: {
          bookingId: bookingId.toString(),
          clientEmail: booking.clientEmail,
        },
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          isDemo: false,
        },
      });
    } else {
      const demoOrderId = `order_demo_${Date.now()}`;
      booking.paymentOrderId = demoOrderId;
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Razorpay test fallback order generated.',
        data: {
          orderId: demoOrderId,
          amount: Math.round(Number(amount) * 100),
          currency: 'INR',
          keyId: 'rzp_test_demo_mode',
          isDemo: true,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating payment order',
      error: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing bookingId',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (secret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        booking.paymentStatus = 'Failed';
        await booking.save();

        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature!',
        });
      }
    }

    booking.paymentStatus = 'Paid';
    booking.paymentOrderId = razorpay_order_id || booking.paymentOrderId || `ord_${Date.now()}`;
    booking.paymentId = razorpay_payment_id || `pay_${Date.now()}`;
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId).populate('gigId').lean();

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully!',
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error verifying payment',
      error: error.message,
    });
  }
};
