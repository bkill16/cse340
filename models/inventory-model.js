const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory names/ids
 * ************************** */
async function getInventoryItems() {
  return await pool.query(
    "SELECT inv_id, inv_make, inv_model, inv_year FROM public.inventory"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  Get all inventory data by inventory_id
 * ************************** */
async function getInventoryByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByInvId error " + error);
  }
}

/* ***************************
 *  Get all upgrade data by inventory_id
 * ************************** */
async function getUpgradesByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.upgrade WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getUpgradesByInvId error: ", error);
    throw new Error("Database query error");
  }
}

/*** add new classification ***/
async function addNewClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return error.message;
  }
}

/*** check if classification already exists ***/
async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const classification = await pool.query(sql, [classification_name]);
    return classification.rowCount;
  } catch (error) {
    return error.message;
  }
}

/*** add new inventory item ***/
async function addNewInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, 
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`;
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    return error.message;
  }
}

/*** add new inventory upgrade ***/
async function addNewUpgrade(
  upgrade_name,
  upgrade_description,
  upgrade_price,
  upgrade_image,
  inv_id
) {
  try {
    const sql = `INSERT INTO upgrade (upgrade_name, upgrade_description, upgrade_price, upgrade_image, 
      inv_id)
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`;
    const result = await pool.query(sql, [
      upgrade_name,
      upgrade_description,
      upgrade_price,
      upgrade_image,
      inv_id
    ]);
    console.log('Add new upgrade result:', result);
    return result;
  } catch (error) {
    console.error('Error adding new upgrade:', error.message);
    return null;
  }
}

/*** update inventory item ***/
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    console.log("Executing updateInventory query");
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
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
      inv_id,
    ]);
    console.log("Query executed, rows affected:", data.rowCount);
    return data.rows[0];
  } catch (error) {
    console.error("Error in updateInventory:", error);
    throw error;
  }
}

/*** delete an inventory item ***/
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("Error in deleteInventory:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryItems,
  getInventoryByClassificationId,
  getInventoryByInvId,
  getUpgradesByInvId,
  addNewClassification,
  checkExistingClassification,
  addNewInventory,
  addNewUpgrade,
  updateInventory,
  deleteInventory
};
