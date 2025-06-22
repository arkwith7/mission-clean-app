const express = require('express');
const router = express.Router();
const { AirconSpec } = require('../models');

// Get all specs
router.get('/', async (req, res) => {
  const specs = await AirconSpec.findAll();
  res.json(specs);
});

// Get by model_name
router.get('/:modelName', async (req, res) => {
  const { modelName } = req.params;
  const spec = await AirconSpec.findOne({ where: { model_name: modelName } });
  if (!spec) return res.status(404).json({ error: '스펙을 찾을 수 없습니다.' });
  res.json(spec);
});

module.exports = router;
