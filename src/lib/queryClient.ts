// import { QueryClient, QueryFunction } from "@tanstack/react-query";

// async function throwIfResNotOk(res: Response) {
//   if (!res.ok) {
//     const text = (await res.text()) || res.statusText;
//     throw new Error(`${res.status}: ${text}`);
//   }
// }

// export async function apiRequest(
//   method: string,
//   url: string,
//   data?: unknown | undefined,
// ): Promise<Response> {
//   const res = await fetch(url, {
//     method,
//     headers: data ? { "Content-Type": "application/json" } : {},
//     body: data ? JSON.stringify(data) : undefined,
//     credentials: "include",
//   });

//   await throwIfResNotOk(res);
//   return res;
// }

// type UnauthorizedBehavior = "returnNull" | "throw";
// export const getQueryFn: <T>(options: {
//   on401: UnauthorizedBehavior;
// }) => QueryFunction<T> =
//   ({ on401: unauthorizedBehavior }) =>
//   async ({ queryKey }) => {
//     const res = await fetch(queryKey[0] as string, {
//       credentials: "include",
//     });

//     if (unauthorizedBehavior === "returnNull" && res.status === 401) {
//       return null;
//     }

//     await throwIfResNotOk(res);
//     return await res.json();
//   };

// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       queryFn: getQueryFn({ on401: "throw" }),
//       refetchInterval: false,
//       refetchOnWindowFocus: false,
//       staleTime: Infinity,
//       retry: false,
//     },
//     mutations: {
//       retry: false,
//     },
//   },
// });

// lib/queryClient.ts
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Base API URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Enhanced apiRequest function with JWT support
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  
  // Get JWT token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // For session cookies if needed
  };
  
  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, config);
    
    // Handle token expiration
    if (response.status === 401 || response.status === 403) {
      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      
      // Clear query cache - use the correct endpoint
      queryClient.setQueryData(["/api/auth/me"], null);
      
      // Redirect to login if not already on login/register pages
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }
    
    return response;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

// Query function factory with enhanced error handling
export function getQueryFn({ on401 }: { on401?: "returnNull" | "throw" } = {}) {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const endpoint = queryKey[0] as string;
    
    try {
      const response = await apiRequest("GET", endpoint);
      
      if (response.status === 401) {
        if (on401 === "returnNull") {
          return null;
        }
        throw new Error("Unauthorized");
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Query failed for ${endpoint}:`, error);
      throw error;
    }
  };
}

// Helper function for protected API calls
export async function protectedApiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  
  if (!token) {
    throw new Error("No authentication token available");
  }
  
  return apiRequest(method, endpoint, body);
}