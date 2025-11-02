import type { AxiosError } from 'axios';

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

/**
 * Checks if an error is an AxiosError
 */
const isAxiosError = (error: unknown): error is AxiosError<ApiErrorResponse> => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.detail || 
           error.response?.data?.message || 
           error.message ||
           'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
