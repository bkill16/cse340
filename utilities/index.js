const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the detail view HTML
 * ************************************ */
Util.buildDetailGrid = function (vehicle) {
  let grid = "";
  if (vehicle) {
    grid += '<div class="detail-container">';
    grid +=
      '<img src="' +
      vehicle.inv_image +
      '" alt="Image of ' +
      vehicle.inv_make +
      " " +
      vehicle.inv_model +
      '">';
    grid += '<div class="vehicle-details">';
    grid +=
      "<h2>" + vehicle.inv_make + " " + vehicle.inv_model + " Details</h2>";
    grid +=
      '<p class="invInfo"><span class="bold">Price:</span> $' +
      new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
      "</p>";
    grid +=
      '<p class="invInfo"><span class="bold">Description:</span> ' +
      vehicle.inv_description +
      "</p>";
    grid +=
      '<p class="invInfo"><span class="bold">Color:</span> ' +
      vehicle.inv_color +
      "</p>";
    grid +=
      '<p class="invInfo"><span class="bold">Miles:</span> ' +
      new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
      "</p>";
    grid += `<button id="upgrade-link-button"><a href="/inv/upgrade-detail/${vehicle.inv_id}">View Upgrades</a></button>`;
    grid += "</div>";
    grid += "</div>";
  }
  return grid;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/*** build inventory item dropdown for the add upgrade view ***/
Util.buildInventoryList = async function (inv_id = null) {
  let data = await invModel.getInventoryItems();
  let inventoryList = '<select name="inv_id" id="inventoryList" required>';
  inventoryList += "<option value=''>Choose Inventory Item</option>";
  data.rows.forEach((row) => {
    inventoryList += `<option value="${row.inv_id}"`; 
    if (inv_id != null && row.inv_id == inv_id) {
      inventoryList += " selected ";
    }
    inventoryList += `>${row.inv_year} ${row.inv_make} ${row.inv_model}</option>`;
  });
  inventoryList += "</select>";
  console.log('Generated inventoryList HTML:', inventoryList);
  return inventoryList;
};

/* **************************************
 * Build the upgrades detail view HTML
 * ************************************ */
Util.buildUpgradeGrid = function (upgrades) {
  let grid = "";
  if (upgrades && upgrades.length > 0) {
    grid += '<div class="upgrade-detail-container">';
    upgrades.forEach((upgrade) => {
      grid += '<div class="upgrade-detail-card">';
      grid += '<div class="upgrade-image-holder">'
      grid +=
        `<img src="${upgrade.upgrade_image}" alt="Image of ${upgrade.upgrade_name}">`;
      grid += '</div>'
      grid +=
        `<h3>${upgrade.upgrade_name}</h3>`;
      grid +=
        `<p class="upgradeInfo"><span class="bold">Description:</span> ${upgrade.upgrade_description}</p>`;
      grid +=
        `<p class="upgradeInfo"><span class="bold">Price:</span> $${new Intl.NumberFormat("en-US").format(upgrade.upgrade_price)}</p>`;
      grid += "</div>";
    });
    grid += "</div>";
  } else {
    grid += '<p class="noUpgrades">There are no upgrades available for this vehicle at this time. Check again soon!</p>';
  }
  return grid;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error("Error caught in handleErrors:", error);
    next(error);
  });
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          res.locals.loggedin = false;
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = true;
        next();
      }
    );
  } else {
    res.locals.loggedin = false;
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

Util.checkAccountType = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err || !["Employee", "Admin"].includes(accountData.account_type)) {
        req.flash("notice", "Unauthorized access. Please log in with appropriate credentials.");
        return res.redirect("/account/login");
      }
      res.locals.accountData = accountData;
      res.locals.loggedin = true;
      next();
    });
  } else {
    req.flash("notice", "Please log in to access this page.");
    res.redirect("/account/login");
  }
};

module.exports = Util;