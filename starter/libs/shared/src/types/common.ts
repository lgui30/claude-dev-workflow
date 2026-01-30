/** Standard list response with pagination metadata */
export interface ListResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** Standard error response returned by the API */
export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  details?: string[];
}

/** Standard timestamp fields present on all resources */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}
