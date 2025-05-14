import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method,
  url,
  data,
) {
  console.log(`API Request: ${method} ${url}`, data);
  
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Log response status
    console.log(`API Response: ${method} ${url} - Status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error: ${method} ${url} - ${res.status}`, errorText);
      throw new Error(errorText || `Request failed with status ${res.status}`);
    }
    
    return res;
  } catch (error) {
    console.error(`API Request Failed: ${method} ${url}`, error);
    throw error;
  }
}

export const getQueryFn = ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      console.log(`Query function for key:`, queryKey);
      
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });
      
      console.log(`Query response:`, res.status);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Unauthorized request (401), returning null as configured`);
        return null;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Query error: ${res.status}`, errorText);
        throw new Error(errorText || `Query failed with status ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`Query data:`, data);
      return data;
    } catch (error) {
      console.error(`Query function error:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});