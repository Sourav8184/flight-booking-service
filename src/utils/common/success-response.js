class SuccessResponse {
  constructor(data, message = 'Successfully completed the request', statusCode = 200) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}

module.exports = SuccessResponse;
