const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const validate = {};

/*** inventory data validation rules ***/
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an inventory make."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an inventory model."),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an inventory year.")
      .isLength({ min: 4, max: 4 })
      .matches(/^[0-9]{4}$/)
      .withMessage("Inventory year must be a 4-digit number."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an inventory description."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an inventory image path.")
      .matches(/^\/images\/vehicles\/.*\.(jpg|jpeg|png|gif)$/i)
      .withMessage(
        "Inventory image must be a valid path (e.g., /images/vehicles/image.jpg)"
      ),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide an inventory thumbnail image path.")
      .matches(/^\/images\/vehicles\/.*\.(jpg|jpeg|png|gif)$/i)
      .withMessage(
        "Inventory thumbnail image must be a valid path (e.g., /images/vehicles/thumbnail.jpg)"
      ),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an inventory price.")
      .matches(/^[0-9]+$/)
      .withMessage("Inventory price can only contain numbers."),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide inventory miles.")
      .matches(/^[0-9]+$/)
      .withMessage("Inventory miles can only contain numbers."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an inventory color."),
  ];
};

/*** check data and return errors or continue to inventory creation ***/
validate.checkInvData = async (req, res, next) => {
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

  // Decode HTML entities in inv_image and inv_thumbnail
  req.body.inv_image = decodeHtmlEntities(inv_image);
  req.body.inv_thumbnail = decodeHtmlEntities(inv_thumbnail);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classDropdown = await utilities.buildClassificationList();

    res.render("inventory/add-inventory", {
      errors: errors.array(),
      title: "Add Inventory",
      nav,
      classDropdown,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
    return;
  }
  next();
};

module.exports = validate;

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
