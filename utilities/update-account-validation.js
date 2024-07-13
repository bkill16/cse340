const utilities = require("./index");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const validate = {};

validate.updateInfoRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const accountId = req.body.account_id;
        const emailExists = await accountModel.checkExistingEmailUpdate(account_email, accountId);
        if (emailExists) {
          throw new Error("This email address is unavailable. Please use a different email address.");
        }
      }),
  ];
};

validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
      .custom(async (account_password, { req }) => {
        const accountId = req.body.account_id;
        const samePassword = await accountModel.checkSamePassword(account_password, accountId);
        if (samePassword) {
          throw new Error("Your new password can't be the same as your current password.");
        }
      }),
  ];
};

validate.checkUpdateInfoData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
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

validate.checkUpdatePasswordData = async (req, res, next) => {
  const { account_id } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update Your Account Information",
      nav,
      account_id,
      account_firstname: req.session.accountData.account_firstname,
      account_lastname: req.session.accountData.account_lastname,
      account_email: req.session.accountData.account_email,
    });
    return;
  }
  next();
};

module.exports = validate;
