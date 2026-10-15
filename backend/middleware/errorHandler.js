export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    err.code === 11000
      ? 409
      : ["CastError", "ValidationError"].includes(err.name)
        ? 400
        : err.statusCode || err.status || 500;
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal Server Error"
        : err.message || "Request failed",
    status: statusCode,
  });
};
