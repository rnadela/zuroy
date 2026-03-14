// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// JWT payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  hotelId?: string;
  iat?: number;
  exp?: number;
}
