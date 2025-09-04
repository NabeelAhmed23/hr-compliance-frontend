import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ApiError } from "@/lib/types/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3005/api",
      timeout: 10000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // No need to add auth headers - cookies are sent automatically

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };

        // Log request in development
        if (process.env.NODE_ENV === "development") {
          console.log("🚀 API Request:", {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time in development
        if (process.env.NODE_ENV === "development") {
          const duration =
            new Date().getTime() -
            (response.config.metadata?.startTime?.getTime() || 0);
          console.log("✅ API Response:", {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            duration: `${duration}ms`,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        // Handle common error scenarios
        const apiError = this.handleError(error);

        // Log error in development
        if (process.env.NODE_ENV === "development") {
          console.error("❌ API Error:", {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            message: apiError.message,
          });
        }

        // Handle 401 unauthorized
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        return Promise.reject(apiError);
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as Record<string, unknown>;
      return {
        message:
          (data?.message as string) ||
          `Request failed with status ${error.response.status}`,
        code: error.response.status,
        details: data,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: "Network error - please check your connection",
        code: "NETWORK_ERROR",
      };
    } else {
      // Something else happened
      return {
        message: error.message || "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      };
    }
  }

  private handleUnauthorized() {
    // Redirect to login with current page as redirect
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const redirectUrl = currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
      window.location.href = `/login${redirectUrl}`;
    }
  }

  // Public methods
  public get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // These methods are not needed for cookie-based auth but kept for API compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setAuthToken(_token: string) {
    // No-op: cookies are managed by the server
  }

  public clearAuthToken() {
    // No-op: cookies are managed by the server
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Type augmentation for request metadata
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}
