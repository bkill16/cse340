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

/* ***************************
 *  Build upgrade detail view
 * ************************** */
invCont.buildUpgradeDetail = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId, 10);
  console.log(`Fetching upgrades for vehicle ID: ${inv_id}`);

  if (isNaN(inv_id)) {
    console.error("Invalid vehicle ID provided");
    return res.status(400).send("Invalid vehicle ID");
  }

  try {
    const data = await invModel.getUpgradesByInvId(inv_id);
    const vehicleData = await invModel.getInventoryByInvId(inv_id);
    console.log(`Upgrades data fetched for vehicle ID: ${inv_id}`, data);

    if (data && data.length > 0) {
      const grid = utilities.buildUpgradeGrid(data);
      let nav = await utilities.getNav();
      const vehicleYear = vehicleData[0].inv_year;
      const vehicleMake = vehicleData[0].inv_make;
      const vehicleModel = vehicleData[0].inv_model;

      res.render("./inventory/upgrade-detail", {
        title: `${vehicleYear} ${vehicleMake} ${vehicleModel} Upgrades`,
        nav,
        grid,
      });
    } else {
      console.error(`No upgrades found for vehicle ID: ${inv_id}`);
      const grid = utilities.buildUpgradeGrid(data);
      const vehicleData = await invModel.getInventoryByInvId(inv_id);
      let nav = await utilities.getNav();
      const vehicleYear = vehicleData[0].inv_year;
      const vehicleMake = vehicleData[0].inv_make;
      const vehicleModel = vehicleData[0].inv_model;
      res.render("./inventory/upgrade-detail", {
        title: `${vehicleYear} ${vehicleMake} ${vehicleModel} Upgrades`,
        nav,
        grid,
      })
    }
  } catch (error) {
    console.error("Error building upgrade detail view: ", error);
    res.status(500).send("Server error");
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

/*** Process new inventory upgrades ***/
invCont.addNewUpgrade = async function (req, res) {
  let nav = await utilities.getNav();
  let invDropdown = await utilities.buildInventoryList();
  const {
    upgrade_name,
    upgrade_description,
    upgrade_price,
    upgrade_image,
    inv_id,
  } = req.body;

  console.log('Form data:', req.body);

  const upgradeResult = await invModel.addNewUpgrade(
    upgrade_name,
    upgrade_description,
    upgrade_price,
    upgrade_image,
    inv_id,
  );

  if (upgradeResult) {
    req.flash(
      "notice",
      `Success! ${upgrade_name} has been added to the database`
    );
    res.redirect("/cse340-motors/inv");
  } else {
    req.flash("notice", "Sorry, unable to add the new upgrade.");
    res.render("inventory/add-upgrade", {
      title: "Add Upgrade",
      nav,
      errors: null,
      invDropdown,
      upgrade_name,
      upgrade_description,
      upgrade_price,
      upgrade_image,
      inv_id
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

// edit inventory
invCont.editInv = async (req, res, next) => {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByInvId(inv_id);

  if (itemData && itemData.length > 0) {
    const item = itemData[0];

    const classificationSelect = await utilities.buildClassificationList(
      item.classification_id
    );
    const itemName = `${item.inv_make} ${item.inv_model}`;
    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_description: item.inv_description,
      inv_image: item.inv_image,
      inv_thumbnail: item.inv_thumbnail,
      inv_price: item.inv_price,
      inv_miles: item.inv_miles,
      inv_color: item.inv_color,
      classification_id: item.classification_id,
    });
  } else {
    req.flash("notice", "No inventory item found.");
    res.redirect("/cse340-motors/inv");
  }
};

/*** update existing inventory ***/
invCont.updateInventory = async function (req, res) {
  console.log("updateInventory function called");
  console.log("Request body in updateInventory:", req.body);

  try {
    let nav = await utilities.getNav();
    console.log("Nav retrieved");

    let {
      inv_id,
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

    // Ensure inv_id is a single value
    if (Array.isArray(inv_id)) {
      inv_id = inv_id[0];
    }

    console.log("Updating inventory with ID:", inv_id);

    const updateResult = await invModel.updateInventory(
      inv_id,
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

    console.log("Update result:", updateResult);

    if (updateResult) {
      console.log("Update successful, redirecting");
      req.flash(
        "notice",
        `Success! ${updateResult.inv_make} ${updateResult.inv_model} has been updated`
      );
      return res.redirect("/cse340-motors/inv");
    } else {
      console.log("Update unsuccessful, rendering edit form");
      req.flash("notice", "Sorry, unable to update the inventory item.");
      const classificationSelect = await utilities.buildClassificationList(
        classification_id
      );
      const itemName = `${inv_make} ${inv_model}`;
      res.status(400).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id,
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
  } catch (error) {
    console.error("Error updating inventory:", error);
  }
};

/*** delete confirmation view ***/
invCont.deleteConfirm = async (req, res, next) => {
  const inv_id = parseInt(req.params.inv_id);
  console.log("inv_id in deleteConfirm:", inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByInvId(inv_id);

  if (itemData && itemData.length > 0) {
    const item = itemData[0];

    const itemName = `${item.inv_make} ${item.inv_model}`;
    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_price: item.inv_price,
      classification_id: item.classification_id,
    });
  } else {
    req.flash("notice", "No inventory item found.");
    res.redirect("/cse340-motors/inv");
  }
};

/*** delete existing inventory ***/
invCont.deleteInventory = async function (req, res) {
  try {
    let nav = await utilities.getNav();

    let { inv_id } = req.body; 
    console.log("inv_id in deleteInventory:", inv_id);

    const deleteResult = await invModel.deleteInventory(inv_id);

    if (deleteResult) {
      req.flash(
        "notice",
        `Success! Inventory item with ID ${inv_id} has been deleted`
      );
      return res.redirect("/cse340-motors/inv");
    } else {
      req.flash("notice", "Sorry, unable to delete the inventory item.");
      const itemData = await invModel.getInventoryByInvId(inv_id);

      if (itemData && itemData.length > 0) {
        const item = itemData[0];

        const itemName = `${item.inv_make} ${item.inv_model}`;
        return res.render("inventory/delete-confirm", {
          title: "Delete " + itemName,
          nav,
          errors: null,
          inv_id: item.inv_id,
          inv_make: item.inv_make,
          inv_model: item.inv_model,
          inv_year: item.inv_year,
          inv_price: item.inv_price,
          classification_id: item.classification_id,
        });
      } else {
        req.flash("notice", "No inventory item found.");
        return res.redirect("/cse340-motors/inv");
      }
    }
  } catch (error) {
    console.error("Error deleting inventory:", error);
  }
};

module.exports = invCont;
