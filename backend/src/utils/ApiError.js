class ApiError extends Error {
  constructor(statusCode, message, code = "INTERNAL_SERVER_ERROR", errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.code = code;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;