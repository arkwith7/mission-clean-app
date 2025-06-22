const express = require('express');
const router = express.Router();
const { Booking } = require('../models');

// Create booking
router.post('/', async (req, res) => {
  try {
    const { service_date, service_time } = req.body;
    const exists = await Booking.findOne({ where: { service_date, service_time } });
    if (exists) return res.status(400).json({ error: '중복 예약이 존재합니다.' });
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all
router.get('/', async (req, res) => {
  const bookings = await Booking.findAll();
  res.json(bookings);
});

// Update status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
