const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/get-question', gameController.getQuestion);
router.post('/check-answer', gameController.checkAnswer);
router.post('/submit-reason', gameController.submitReason);
router.post('/get-clue', gameController.getClue);

module.exports = router;
