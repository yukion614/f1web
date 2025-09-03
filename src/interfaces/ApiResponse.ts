export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  error?: string;
}
