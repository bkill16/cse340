const pool = require("../database/index");
const bcrypt = require("bcryptjs");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email for updates
 * ********************* */
async function checkExistingEmailUpdate(newEmail, accountId) {
  try {
    const sql =
      "SELECT * FROM account WHERE account_email = $1 AND account_id != $2";
    const result = await pool.query(sql, [newEmail, accountId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error in checkExistingEmailUpdate:", error);
    throw error;
  }
}

// Check if updated password is the same as current password
async function checkSamePassword(newPassword, account_id) {
  try {
    const sql = "SELECT account_password FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [account_id]);

    if (result.rows.length > 0) {
      const currentPasswordHash = result.rows[0].account_password;
      const isSamePassword = await bcrypt.compare(newPassword, currentPasswordHash);
      return isSamePassword;
    }
    
    return false; // No account found with the given account_id
  } catch (error) {
    console.error("Error in checkSamePassword:", error);
    throw error;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

// get account by account id
async function getAccountById(account_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.account
      WHERE account_id = $1`,
      [account_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getAccountById error " + error);
  }
}

// update account password
async function updateAccountPassword(account_password, account_id) {
  try {
    console.log("Executing updateAccountPassword query");
    const sql =
      "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const data = await pool.query(sql, [account_password, account_id]);
    console.log("query executed, rows affected:", data.rowCount);
    return data.rows[0];
  } catch (error) {
    console.error("error is updateAccountPassword:", error);
    throw error;
  }
}

// update account information
async function updateAccountInfo(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    console.log("Executing updateAccountInfo query");
    const sql =
      "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);
    console.log("Query executed, rows affected:", data.rowCount);
    return data.rows[0];
  } catch (error) {
    console.error("Error in updateAccountInfo:", error);
    throw error;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  checkExistingEmailUpdate,
  checkSamePassword,
  getAccountByEmail,
  getAccountById,
  updateAccountPassword,
  updateAccountInfo,
};
