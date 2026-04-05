class ErrorResponse {
  constructor(message = 'Something went wrong', error = null, statusCode = 500) {
    this.success = false;
    this.message = message;
    this.data = {};
    this.error = error;
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
