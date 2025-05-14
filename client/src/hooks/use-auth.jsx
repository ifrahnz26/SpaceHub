import { createContext, useContext } from "react";
import {
  useQuery,
  useMutation
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient.js";
import { useToast } from "@/hooks/use-toast.jsx";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 30000, // 30 seconds
    retry: 1
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      console.log('Sending login request with:', credentials);
      try {
        // Use fetch directly with credentials: 'include' to ensure cookies are sent/received
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include", // Important for cookies
          body: JSON.stringify(credentials)
        });
        
        // Handle non-OK responses
        if (!res.ok) {
          const errText = await res.text();
          console.error(`Login failed with status ${res.status}:`, errText);
          throw new Error(errText || `Login failed with status ${res.status}`);
        }
        
        const userData = await res.json();
        console.log('Login successful, user data:', userData);
        return userData;
      } catch (error) {
        console.error('Login request failed:', error);
        throw error;
      }
    },
    onSuccess: (user) => {
      console.log('Login mutation success, setting user data:', user);
      queryClient.setQueryData(["/api/user"], user);
      
      // Invalidate and refetch user data to ensure it's properly stored
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      refetchUser(); // Explicitly refetch user data
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name || user.username}!`
      });
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Authentication failed. Please check your credentials.",
        variant: "destructive"
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name || user.username}!`
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        refetchUser
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