const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a gig title'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Development',
      'Design',
      'Video Editing',
      'Writing',
      'Marketing',
      'Photography',
      'UI/UX',
      'Other'
    ],
  },
  rate: {
    type: Number,
    required: [true, 'Please provide a rate/price in INR'],
    min: [0, 'Rate cannot be negative'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  skills: {
    type: [String],
    required: [true, 'Please list at least one skill'],
  },
  creatorName: {
    type: String,
    required: [true, 'Please provide creator name'],
    trim: true,
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 12,
  },
  completedProjects: {
    type: Number,
    default: 12,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Gig', GigSchema);
