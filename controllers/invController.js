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

module.exports = invCont;
