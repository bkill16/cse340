const express = require('express');
const router = express.Router();
const errorsController = require('../controllers/errorsController');

router.get('/', errorsController.triggerError);

module.exports = router;
