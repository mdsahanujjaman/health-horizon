const router = require('express').Router();
router.get('/health', (req, res) => res.json({ status: 'UP', service: 'Health Horizon API', version: '1.0.0' }));
router.get('/', (req, res) => res.json({ message: 'Welcome to Health Horizon API' }));
module.exports = router;
