const classValidate = require("../utilities/classification-validation");
const invValidate = require("../utilities/inventory-validation");
const upgradeValidate = require("../utilities/upgrade-validation");
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const managementController = require("../controllers/managementController");
const invController = require("../controllers/invController");

router.get(
  "/inv",
  utilities.checkAccountType,
  utilities.handleErrors(managementController.buildManagementButtons)
);

router.get(
  "/inv/add-classification",
  utilities.checkAccountType,
  utilities.handleErrors(managementController.buildAddClassification)
);

router.get(
  "/inv/add-inventory",
  utilities.checkAccountType,
  utilities.handleErrors(managementController.buildAddInventory)
);

router.get(
  "/inv/add-upgrade",
  utilities.checkAccountType,
  utilities.handleErrors(managementController.buildAddUpgrade)
);

router.post(
  "/inv/add-classification",
  utilities.checkAccountType,
  classValidate.classificationRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addNewClassification)
);

router.post(
  "/inv/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addNewInventory)
);

router.post(
  "/inv/add-upgrade",
  utilities.checkAccountType,
  upgradeValidate.upgradeRules(),
  upgradeValidate.checkUpgradeData,
  utilities.handleErrors(invController.addNewUpgrade)
);

module.exports = router;
