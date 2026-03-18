const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const axios = require('axios');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
router.post('/predict', authenticate, async (req, res, next) => {
    try { const r = await axios.post(`${ML_URL}/predict`, req.body); res.json(r.data); } catch (err) { next(err); }
});
router.post('/chat', authenticate, async (req, res, next) => {
    try { const r = await axios.post(`${ML_URL}/chat`, req.body); res.json(r.data); } catch (err) { next(err); }
});
router.get('/health-insight', authenticate, async (req, res, next) => {
    try { const r = await axios.get(`${ML_URL}/health-insight`, { params: req.query }); res.json(r.data); } catch (err) { next(err); }
});
module.exports = router;
