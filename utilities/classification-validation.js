const utilities = require("./index");
const classModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/*** classification data validation rules ***/
validate.classificationRules = () => {
    return [
        // classification name is required and must be a string, cannot contain special characters or spaces, 
        // and cannot already exist in the database
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a classification name.")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("Classification name cannot contain special characters or spaces.")
        .custom(async (classification_name) => {
            const classExists = await classModel.checkExistingClassification(
                classification_name
            );
            if (classExists) {
                throw new Error("This classification already exists in the database.")
            }
        })
    ]
}

/*** check data and return errors or continue to classification creation ***/
validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors: errors.array(),
      title: "Add Classification",
      nav,
      classification_name
    });
    return;
  }
  next();
};

module.exports = validate;