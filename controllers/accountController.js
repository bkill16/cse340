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
    accountUpdate: res.locals.accountUpdate || null,
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

// process account password update
async function updateAccountPassword(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let { account_id, account_password } = req.body;

    let hashedPassword;

    if (Array.isArray(account_id)) {
      account_id = account_id[0];
    }

    try {
      hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
      req.flash(
        "notice",
        "Sorry, there was an error processing the password update."
      );
      return res.status(500).render("account/update", {
        title: "Update Your Account Information",
        nav,
        errors: null,
        account_id,
        account_firstname: req.session.accountData.account_firstname,
        account_lastname: req.session.accountData.account_lastname,
        account_email: req.session.accountData.account_email,
      });
    }

    const updateResult = await accountModel.updateAccountPassword(
      hashedPassword,
      account_id
    );

    if (updateResult) {
      req.session.accountData.account_password = hashedPassword;
      req.flash(
        "notice",
        `Success, ${req.session.accountData.account_firstname}! Your account password has been updated.`
      );
      res.render("account/account-management", {
        title: "Manage Your Account",
        nav,
        errors: null,
        accountData: req.session.accountData,
        accountUpdate: {
          success: true,
          account: req.session.accountData,
          message: "Account password updated successfully.",
        },
      });
    } else {
      req.flash("notice", "Sorry, unable to update your account password.");
      res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    console.error("Error updating account password:", error);
    next(error);
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

    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      req.session.accountData = updateResult; // Update session data
      const accessToken = jwt.sign(
        updateResult,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

      req.flash(
        "notice",
        `Success, ${account_firstname}! Your account info has been updated.`
      );
      res.render("account/account-management", {
        title: "Manage Your Account",
        nav,
        errors: null,
        accountData: updateResult,
        accountUpdate: {
          success: true,
          account: updateResult,
          message: "Account information updated successfully.",
        },
      });
    } else {
      req.flash("notice", "Sorry, unable to update your account information.");
      res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    console.error("Error updating account info:", error);
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
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  
  try {
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
    }

    return res.redirect("/account/account-management");
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("notice", "An unexpected error occurred. Please try again later.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
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
  updateAccountPassword,
  updateAccountInfo,
};
