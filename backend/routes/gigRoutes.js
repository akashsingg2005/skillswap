const express = require('express');
const router = express.Router();
const { getGigs, getGigById, createGig } = require('../controllers/gigController');

router.route('/')
  .get(getGigs)
  .post(createGig);

router.route('/:id')
  .get(getGigById);

module.exports = router;
