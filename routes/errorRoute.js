const express = require("express");
const router = express.Router();
const utilities = require("../utilities/index");
const errorsController = require("../controllers/errorsController");

router.get("/", utilities.handleErrors(errorsController.triggerError));

module.exports = router;
