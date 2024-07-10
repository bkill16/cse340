const classValidate = require("../utilities/classification-validation");
const invValidate = require("../utilities/inventory-validation");
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const managementController = require("../controllers/managementController");
const invController = require("../controllers/invController");

router.get(
  "/inv",
  utilities.handleErrors(managementController.buildManagementButtons)
);

router.get(
  "/inv/add-classification",
  utilities.handleErrors(managementController.buildAddClassification)
);

router.get(
  "/inv/add-inventory",
  utilities.handleErrors(managementController.buildAddInventory)
);

router.post(
  "/inv/add-classification",
  classValidate.classificationRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addNewClassification)
);

router.post(
  "/inv/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addNewInventory)
);

module.exports = router;
