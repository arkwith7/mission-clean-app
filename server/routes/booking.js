const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/bookings - list all bookings
router.get('/', (req, res) => {
  const sql = `SELECT b.booking_id, b.booking_date, b.booking_time, b.status, b.total_price,
      c.name AS customer_name, c.phone AS customer_phone, s.service_name
    FROM bookings b
    JOIN customers c ON b.customer_id = c.customer_id
    JOIN services s ON b.service_id = s.service_id
    ORDER BY b.created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ bookings: rows });
  });
});

// GET /api/bookings/:id - get booking by ID
router.get('/:id', (req, res) => {
  const sql = `SELECT b.*, c.name AS customer_name, c.phone AS customer_phone, s.service_name
    FROM bookings b
    JOIN customers c ON b.customer_id = c.customer_id
    JOIN services s ON b.service_id = s.service_id
    WHERE b.booking_id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ booking: row });
  });
});

// POST /api/bookings - create new booking
router.post('/', (req, res) => {
  const { customer_id, service_id, booking_date, booking_time, total_price } = req.body;
  const sql = `INSERT INTO bookings (customer_id, service_id, booking_date, booking_time, total_price)
    VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [customer_id, service_id, booking_date, booking_time, total_price], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ booking_id: this.lastID });
  });
});

// GET /api/bookings/services - list services
router.get('/services', (req, res) => {
  const sql = `SELECT * FROM services WHERE is_active = 1`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ services: rows });
  });
});

// GET /api/bookings/stats - booking stats
router.get('/stats', (req, res) => {
  const sql = `SELECT COUNT(*) AS total_bookings, SUM(total_price) AS total_revenue FROM bookings WHERE status = 'completed'`;
  db.get(sql, [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ stats: row });
  });
});

module.exports = router;
