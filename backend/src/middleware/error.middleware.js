const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Internal Server Error",
    ...(err.errors?.length ? { errors: err.errors } : {}),
  });
};

export default errorHandler;