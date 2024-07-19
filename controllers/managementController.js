const utilities = require("../utilities/index");

/*** Deliver management view ***/
async function buildManagementButtons(req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
  });
}

/*** Deliver add classification view ***/
async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
}

/*** Deliver add inventory view ***/
async function buildAddInventory(req, res, next) {
  let nav = await utilities.getNav();
  let classDropdown = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    classDropdown,
  });
}

/*** Deliver add upgrade view ***/
async function buildAddUpgrade(req, res, next) {
  let nav = await utilities.getNav();
  let invDropdown = await utilities.buildInventoryList();
  res.render("inventory/add-upgrade", {
    title: "Add Upgrade",
    nav,
    errors: null,
    invDropdown,
  });
}

module.exports = {
  buildManagementButtons,
  buildAddClassification,
  buildAddInventory,
  buildAddUpgrade,
};
