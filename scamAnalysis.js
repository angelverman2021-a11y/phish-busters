const express = require('express');
const router = express.Router();
const { analyzeScam } = require('../controllers/biasAnalyzer');

router.post('/analyze-scam', analyzeScam);

module.exports = router;
