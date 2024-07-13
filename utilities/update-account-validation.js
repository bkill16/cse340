const utilities = require("./index");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.updateInfoRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      // needs changed
      .custom(async (account_email, { req }) => {
        const accountId = req.body.account_id;
        const emailExists = await accountModel.checkExistingEmailUpdate(
          account_email,
          accountId
        );
        if (emailExists) {
          throw new Error(
            "This email address is unavailable. Please use a different email address."
          );
        }
      }),
  ];
};

validate.checkUpdateInfoData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update Your Account Information",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

module.exports = validate;
