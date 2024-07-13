const bcrypt = require("bcryptjs");
const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Manage Your Account",
    nav,
    errors: null,
  });
}

// account update view
async function buildAccountUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id);
  let nav = await utilities.getNav();
  const itemData = await accountModel.getAccountById(account_id);

  if (itemData && itemData.length > 0) {
    const item = itemData[0];

    res.render("account/update", {
      title: "Update Your Account Information",
      nav,
      errors: null,
      account_id: item.account_id,
      account_firstname: item.account_firstname,
      account_lastname: item.account_lastname,
      account_email: item.account_email,
      account_password: item.account_password,
    });
  } else {
    req.flash("notice", "No account found.");
    res.redirect("/");
  }
}

// process account info update
async function updateAccountInfo(req, res, next) {
  try {
    let nav = await utilities.getNav();

    let { account_id, account_firstname, account_lastname, account_email } =
      req.body;

    if (Array.isArray(account_id)) {
      account_id = account_id[0];
    }

    console.log("Updating account with ID:", account_id);

    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    console.log("Update result:", updateResult);

    if (updateResult) {
      const updatedAccount = await accountModel.getAccountById(account_id);

      req.session.accountData = updatedAccount[0];

      req.flash(
        "notice",
        `Success, ${account_firstname}! Your account info has been updated.`
      );

      res.render("account/account-management", {
        title: "Manage Your Account",
        nav,
        errors: null,
        accountData: req.session.accountData,
        accountUpdate: {
          success: true,
          account: req.session.accountData,
        },
      });
    } else {
      res.render("account/account-management", {
        title: "Manage Your Account",
        nav,
        errors: null,
        accountData: req.session.accountData,
        accountUpdate: {
          success: false,
          message: "Sorry, unable to update your account information.",
        },
      });
    }
  } catch (error) {
    console.error("Error updating account:", error);
    next(error);
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/account-management");
    }
  } catch (error) {
    return new Error("Access Forbidden");
  }
}

// process logout
async function accountLogout(req, res) {
  try {
    res.clearCookie("jwt");

    if (req.session) {
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    res.redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    res.redirect("/");
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,
  buildAccountUpdate,
  registerAccount,
  accountLogin,
  accountLogout,
  updateAccountInfo
};
