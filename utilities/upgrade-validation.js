const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const validate = {};

/*** upgrade data validation rules ***/
validate.upgradeRules = () => {
  return [
    body("upgrade_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an upgrade name."),

    body("upgrade_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an upgrade description."),

    body("upgrade_price")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an upgrade price.")
      .matches(/^[0-9]+$/)
      .withMessage("Upgrade price can only contain numbers."),

    body("upgrade_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an upgrade image path.")
      .matches(/^\/images\/upgrades\/.*\.(jpg|jpeg|png|gif)$/i)
      .withMessage(
        "Upgrade image must be a valid path (e.g., /images/upgrades/image.jpg)"
      ),
  ];
};

/*** check data and return errors or continue to upgrade creation ***/
validate.checkUpgradeData = async (req, res, next) => {
  const {
    upgrade_name,
    upgrade_description,
    upgrade_price,
    upgrade_image,
    inv_id
  } = req.body;

  // Decode HTML entities in upgrade_image
  req.body.upgrade_image = decodeHtmlEntities(upgrade_image);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let invDropdown = await utilities.buildInventoryList();

    res.render("inventory/add-upgrade", {
      errors: errors.array(),
      title: "Add Upgrade",
      nav,
      invDropdown,
      upgrade_name,
      upgrade_description,
      upgrade_price,
      upgrade_image,
      inv_id
    });
    return;
  }
  next();
};

// /*** check data and return errors on the edit view or continue to inventory update ***/
// validate.checkUpdateData = async (req, res, next) => {
//   console.log("checkUpdateData called");

//   const {
//     inv_id,
//     inv_make,
//     inv_model,
//     inv_year,
//     inv_description,
//     inv_image,
//     inv_thumbnail,
//     inv_price,
//     inv_miles,
//     inv_color,
//     classification_id,
//   } = req.body;

//   console.log("Request body:", req.body);

//   // Decode HTML entities in inv_image and inv_thumbnail
//   req.body.inv_image = decodeHtmlEntities(inv_image);
//   req.body.inv_thumbnail = decodeHtmlEntities(inv_thumbnail);

//   console.log("Decoded image URLs:");
//   console.log("inv_image:", req.body.inv_image);
//   console.log("inv_thumbnail:", req.body.inv_thumbnail);

//   let errors = validationResult(req);
//   console.log("Validation errors:", errors.array());

//   if (!errors.isEmpty()) {
//     console.log("Validation failed, rendering edit-inventory view");
//     let nav = await utilities.getNav();
//     let classDropdown = await utilities.buildClassificationList();
//     let itemName = `${inv_make} ${inv_model}`;

//     res.render("inventory/add-inventory", {
//       errors: errors.array(),
//       title: "Edit " + itemName,
//       nav,
//       classDropdown,
//       inv_id,
//       inv_make,
//       inv_model,
//       inv_year,
//       inv_description,
//       inv_image: req.body.inv_image,
//       inv_thumbnail: req.body.inv_thumbnail,
//       inv_price,
//       inv_miles,
//       inv_color,
//       classification_id,
//     });
//     return;
//   }

//   console.log("Validation passed, calling next middleware");
//   next();
// };

const decodeHtmlEntities = (text) => {
  const entities = {
    "&#x2F;": "/",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };
  return text.replace(
    /&#x2F;|&amp;|&lt;|&gt;|&quot;|&#39;/g,
    (match) => entities[match]
  );
};

module.exports = validate;
