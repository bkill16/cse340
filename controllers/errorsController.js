exports.triggerError = async (req, res, next) => {
  try {
    throw new Error("Intentional server error occurred");
  } catch (err) {
    err.status = 500;
    next(err);
  }
};
