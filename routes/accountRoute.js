const regValidate = require("../utilities/account-validation");
const loginValidate = require("../utilities/account-validation");
const updateInfoValidate = require("../utilities/update-account-validation");
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.get(
  "/account-management",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);

router.get(
  "/update/:account_id",
  utilities.handleErrors(accountController.buildAccountUpdate)
);

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  loginValidate.loginRules(),
  loginValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.post(
  "/update/account-info",
  updateInfoValidate.updateInfoRules(),
  updateInfoValidate.checkUpdateInfoData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

module.exports = router;
