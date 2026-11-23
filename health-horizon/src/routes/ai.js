const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const axios = require('axios');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

router.post('/predict', authenticate, async (req, res, next) => {
    try { const r = await axios.post(`${ML_URL}/predict`, req.body, { timeout: 10000 }); res.json(r.data); } catch (err) { next(err); }
});

router.post('/chat', authenticate, async (req, res, next) => {
    try { const r = await axios.post(`${ML_URL}/chat`, req.body, { timeout: 15000 }); res.json(r.data); } catch (err) { next(err); }
});

router.get('/health-insight', authenticate, async (req, res, next) => {
    try { const r = await axios.get(`${ML_URL}/health-insight`, { params: req.query, timeout: 10000 }); res.json(r.data); } catch (err) { next(err); }
});

// This endpoint provides safe routing guidance only; it does not diagnose or prescribe.
router.post('/analyze', authenticate, async (req, res, next) => {
    try {
        const symptoms = req.body?.symptoms;
        if (typeof symptoms !== 'string' || symptoms.trim().length === 0 || symptoms.length > 2000) {
            return res.status(400).json({
                error: 'Symptoms must be a non-empty string of at most 2000 characters.'
            });
        }

        const text = symptoms.toLowerCase();
        const emergencyPatterns = [
            /chest pain|chest pressure/,
            /difficulty breathing|trouble breathing|shortness of breath|cannot breathe/,
            /unconscious|not responding|loss of consciousness/,
            /face droop|one-sided weakness|sudden weakness|slurred speech/,
            /severe bleeding|uncontrolled bleeding/,
            /seizure|convulsion/
        ];
        const urgent = emergencyPatterns.some((pattern) => pattern.test(text));

        res.json({
            possibleDiagnosis: 'Clinical assessment required',
            suggestion: urgent
                ? 'The symptoms described may indicate a medical emergency. Seek emergency medical care now or contact your local emergency service. Do not wait for an online assessment.'
                : 'This tool cannot determine the cause of symptoms. Arrange an assessment with a qualified healthcare professional. If symptoms are severe, rapidly worsening, or concerning, seek urgent medical care.',
            urgency: urgent ? 'EMERGENCY_ASSESSMENT' : 'CLINICIAN_ASSESSMENT',
            disclaimer: 'Health Horizon does not provide a diagnosis or prescribe treatment through this endpoint. A qualified healthcare professional must assess the patient and make all clinical decisions.'
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
