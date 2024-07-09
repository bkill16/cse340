const utilities = require("../utilities/index");

/*** Deliver management view ***/
async function buildManagementButtons(req, res, next) {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect
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
  let classDropdown = await utilities.buildClassificationList()  // Note the parentheses here
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    classDropdown
  });
}

module.exports = { buildManagementButtons, buildAddClassification, buildAddInventory }