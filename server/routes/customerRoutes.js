const express = require('express');
const router = express.Router();
const { Customer } = require('../models');

// Create or update customer
router.post('/', async (req, res) => {
  try {
    const [customer, created] = await Customer.upsert(req.body, { returning: true });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
