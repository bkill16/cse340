const utilities = require("../utilities/index");

/*** Deliver management view ***/
async function buildManagementButtons(req, res, next) {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    });
  }

/*** Deliver add classification view ***/
async function buildAddClassification(req, res, next) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    });
  }

/*** Deliver add inventory view ***/
async function buildAddInventory(req, res, next) {
    let nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null
    });
  }

module.exports = { buildManagementButtons, buildAddClassification, buildAddInventory }