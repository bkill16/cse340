const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryByInvId(inv_id);

  if (data && data.length > 0) {
    const vehicle = data[0];
    const grid = await utilities.buildDetailGrid(vehicle);
    let nav = await utilities.getNav();
    const vehicleYear = vehicle.inv_year;
    const vehicleMake = vehicle.inv_make;
    const vehicleModel = vehicle.inv_model;

    res.render("./inventory/detail", {
      title: vehicleYear + " " + vehicleMake + " " + vehicleModel,
      nav,
      grid,
    });
  }
};

/*** Process new classification ***/
invCont.addNewClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  const classResult = await invModel.addNewClassification(classification_name);

  if (classResult) {
    req.flash(
      "notice",
      `Success! The ${classification_name} classification has been added to the database.`
    );
    res.redirect("/cse340-motors/inv");
  } else {
    req.flash("notice", "Sorry, unable to add the new classification.");
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    });
  }
};

/*** Process new inventory ***/
invCont.addNewInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classDropdown = await utilities.buildClassificationList();
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const invResult = await invModel.addNewInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (invResult) {
    req.flash(
      "notice",
      `Success! ${inv_make} ${inv_model} has been added to the database`
    );
    res.redirect("/cse340-motors/inv");
  } else {
    req.flash("notice", "Sorry, unable to add the new inventory item.");
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classDropdown,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

module.exports = invCont;
