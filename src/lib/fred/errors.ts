export class FredApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'FredApiError';
    this.statusCode = statusCode;
  }
}

export class FredRateLimitError extends FredApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'FredRateLimitError';
  }
}

export class FredNotFoundError extends FredApiError {
  constructor(message: string = 'Series not found') {
    super(message, 404);
    this.name = 'FredNotFoundError';
  }
}

export class FredValidationError extends FredApiError {
  constructor(message: string = 'Invalid parameters') {
    super(message, 400);
    this.name = 'FredValidationError';
  }
}
