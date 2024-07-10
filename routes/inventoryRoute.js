const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");

router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInventoryId)
);

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get("/edit/:inv_id", utilities.handleErrors(invController.editInv));

router.post(
  "/update/",
  (req, res, next) => {
    console.log("Update route hit");
    next();
  },
  (req, res, next) => {
    console.log("Before inventoryRules");
    next();
  },
  invValidate.inventoryRules(),
  (req, res, next) => {
    console.log("After inventoryRules, before checkUpdateData");
    next();
  },
  invValidate.checkUpdateData,
  (req, res, next) => {
    console.log("After checkUpdateData, before updateInventory");
    next();
  },
  utilities.handleErrors(invController.updateInventory)
);

module.exports = router;
