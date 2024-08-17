export class ApiResponse {
  constructor(status, message, data = null) {
    this.status = status;
    this.message = message;
    this.response = data;
  }
}
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.error = message;
  }
}
