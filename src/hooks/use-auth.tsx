// "use client";
// import { createContext, ReactNode, useContext } from "react";
// import {
//   useQuery,
//   useMutation,
//   UseMutationResult,
// } from "@tanstack/react-query";
// // import { insertUserSchema, User, InsertUser } from "@shared/schema";
// import { insertUserSchema,User, InsertUser } from "../../shared/schema";
// import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
// import { useToast } from "@/hooks/use-toast";

// type AuthContextType = {
//   user: User | null;
//   isLoading: boolean;
//   error: Error | null;
//   loginMutation: UseMutationResult<User, Error, LoginData>;
//   logoutMutation: UseMutationResult<void, Error, void>;
//   registerMutation: UseMutationResult<User, Error, InsertUser>;
// };

// type LoginData = Pick<InsertUser, "username" | "password">;

// export const AuthContext = createContext<AuthContextType | null>(null);
// export function AuthProvider({ children }: { children: ReactNode }) {
//   const { toast } = useToast();
//   const {
//     data: user,
//     error,
//     isLoading,
//   } = useQuery<User | undefined, Error>({
//     queryKey: ["http://localhost:5000/api/user"],
//     queryFn: getQueryFn({ on401: "returnNull" }),
//     retry: false,
//   });

//   const loginMutation = useMutation({
//     mutationFn: async (credentials: LoginData) => {
//       const res = await apiRequest("POST", "http://localhost:5000/api/login", credentials);
//       return await res.json();
//     },
//     onSuccess: (user: User) => {
//       queryClient.setQueryData(["http://localhost:5000/api/user"], user);
//       toast({
//         title: "Logged in successfully",
//         description: `Welcome back, ${user.username}!`,
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Login failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const registerMutation = useMutation({
//     mutationFn: async (credentials: InsertUser) => {
//       const res = await apiRequest("POST", "http://localhost:5000/api/register", credentials);
//       return await res.json();
//     },
//     onSuccess: (user: User) => {
//       queryClient.setQueryData(["http://localhost:5000/api/user"], user);
//       toast({
//         title: "Registration successful",
//         description: `Welcome, ${user.username}!`,
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Registration failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const logoutMutation = useMutation({
//     mutationFn: async () => {
//       await apiRequest("POST", "http://localhost:5000/api/logout");
//     },
//     onSuccess: () => {
//       queryClient.setQueryData(["http://localhost:5000/api/user"], null);
//       toast({
//         title: "Logged out successfully",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Logout failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   return (
//     <AuthContext.Provider
//       value={{
//         user: user ?? null,
//         isLoading,
//         error,
//         loginMutation,
//         logoutMutation,
//         registerMutation,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User, InsertUser } from "../../shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LoginResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResponse, Error, InsertUser>;
  isAuthenticated: boolean;
};

type LoginData = Pick<InsertUser, "username" | "password">;

type LoginResponse = {
  token: string;
  user: User;
};

type RegisterResponse = {
  token: string;
  user: User;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get token helper function
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("authToken");
  };

  // Check for current user with JWT token
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      console.log('🔄 Fetching user data...');
      
      const token = getToken();
      console.log('📱 Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No token found, returning null');
        return null;
      }

      try {
        const response = await apiRequest("GET", "/api/auth/me");
        console.log('📡 Auth API Response status:', response.status, response.ok);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('🔒 Unauthorized, clearing token');
            if (typeof window !== 'undefined') {
              localStorage.removeItem("authToken");
            }
            return null;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const userData = await response.json();
        console.log('✅ User data fetched:', userData);
        return userData;
        
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem("authToken");
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in newer versions)
    enabled: isClient && !!getToken(), // Only run when client-side and token exists
  });

  // Debug logging
  useEffect(() => {
    if (isClient) {
      console.log('🏠 Auth Provider State:', {
        user,
        isLoading,
        error,
        hasToken: !!getToken()
      });
    }
  }, [user, isLoading, error, isClient]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<LoginResponse> => {
      console.log('🚀 Login mutation triggered');

      const res = await apiRequest("POST", "/api/auth/login", credentials);
      console.log('📡 Login response status:', res.status, res.ok);
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(data.message || `Login failed: ${res.status}`);
      }

      const data = await res.json();
      console.log("📦 Login response data received");
      
      return data;
    },
    onSuccess: async (data: LoginResponse) => {
      console.log('✅ Login successful, storing token and user data');
      console.log("token:", data.token);
      
      try {
        // Store JWT token
        localStorage.setItem("authToken", data.token);
        
        // Update query cache with user data
        queryClient.setQueryData(["/api/auth/me"], data.user);
        
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${data.user.username}!`,
        });
        
        console.log('🎯 Redirecting to dashboard');
        // Use replace to prevent back navigation to login
        router.replace("/dashboard");
      } catch (error) {
        console.error('Error during login success handling:', error);
      }
    },
    onError: (error: Error) => {
      console.error("❌ Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser): Promise<RegisterResponse> => {
      console.log('🚀 Register mutation triggered');
      
      try {
        // Validate input data
        const validatedData = insertUserSchema.parse(credentials);

        const res = await apiRequest("POST", "/api/auth/register", validatedData);
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({ message: 'Registration failed' }));
          throw new Error(data.message || `Registration failed: ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch (error) {
        if (typeof error === "object" && error !== null && "name" in error && (error as { name?: string }).name === 'ZodError') {
          throw new Error('Invalid registration data provided');
        }
        throw error;
      }
    },
    onSuccess: async (data: RegisterResponse) => {
      console.log('✅ Registration successful');
      
      try {
        // Store JWT token
        localStorage.setItem("authToken", data.token);
        
        // Update query cache with user data
        queryClient.setQueryData(["/api/auth/me"], data.user);

        toast({
          title: "Registration successful",
          description: `Welcome, ${data.user.username}!`,
        });
        
        // Redirect to dashboard
        router.replace("/dashboard");
      } catch (error) {
        console.error('Error during registration success handling:', error);
      }
    },
    onError: (error: Error) => {
      console.error("❌ Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      console.log('🚪 Logout mutation triggered');
      
      // Call logout endpoint (optional - for session cleanup)
      try {
        await apiRequest("POST", "/api/auth/logout");
      } catch (error) {
        // Even if logout endpoint fails, we should still clear local data
        console.warn("Logout endpoint failed:", error);
      }
    },
    onSuccess: () => {
      console.log('✅ Logout successful, clearing data');
      handleLogoutCleanup();
    },
    onError: (error: Error) => {
      console.log('❌ Logout error, clearing data anyway');
      handleLogoutCleanup("Logged out locally due to error");
    },
  });

  const handleLogoutCleanup = (errorMessage?: string) => {
    // Clear JWT token
    if (typeof window !== 'undefined') {
      localStorage.removeItem("authToken");
    }
    
    // Clear user data from cache
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear(); // Clear all cached data
    
    toast({
      title: errorMessage ? "Logged out" : "Logged out successfully",
      description: errorMessage,
      variant: errorMessage ? "destructive" : "default",
    });
    
    // Redirect to login
    router.replace('/login');
  };

  // Auto-logout on token expiration or invalid token
  useEffect(() => {
    if (error && (error.message.includes("401") || error.message.includes("Unauthorized"))) {
      console.log('🔒 401 error detected, clearing auth data');
      if (typeof window !== 'undefined') {
        localStorage.removeItem("authToken");
      }
      queryClient.setQueryData(["/api/auth/me"], null);
      
      // Don't redirect if we're already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
        router.replace('/login');
      }
    }
  }, [error, router]);

  // Calculate isAuthenticated properly
  const isAuthenticated = isClient && !!user && !!getToken();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading || !isClient,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}