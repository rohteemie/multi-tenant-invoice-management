import type { AxiosError } from 'axios';

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.detail || 
           axiosError.response?.data?.message || 
           'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
