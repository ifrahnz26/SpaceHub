import { useAuth } from "@/hooks/use-auth.jsx";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}) {
  const { user, isLoading } = useAuth();
  console.log('Protected route:', path, 'user:', user, 'isLoading:', isLoading);

  return (
    <Route path={path}>
      {isLoading ? (
        // Loading state
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary">Loading...</span>
        </div>
      ) : !user ? (
        // Not authenticated - redirect to login
        <Redirect to="/auth" />
      ) : (
        // Authenticated - render component
        <Component />
      )}
    </Route>
  );
}