import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster.jsx";
import { TooltipProvider } from "@/components/ui/tooltip.jsx";
import NotFound from "@/pages/not-found.jsx";
import AuthPage from "@/pages/auth-page.jsx";
import Dashboard from "@/pages/dashboard.jsx";
import NewBooking from "@/pages/new-booking.jsx";
import MyBookings from "@/pages/my-bookings.jsx";
import PendingApprovals from "@/pages/pending-approvals.jsx";
import { ProtectedRoute } from "./lib/protected-route.jsx";
import { AuthProvider, useAuth } from "./hooks/use-auth.jsx";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/new-booking" component={NewBooking} />
      <ProtectedRoute path="/my-bookings" component={MyBookings} />
      <ProtectedRoute path="/pending-approvals" component={PendingApprovals} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Debug component needs to be used inside the AuthProvider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Separate component to access auth context
function AppContent() {
  const { user, isLoading } = useAuth();
  
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
      
      {/* Debug auth state indicator */}
      {import.meta.env.DEV && (
        <div 
          style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px', 
            background: '#000', 
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
            opacity: 0.7
          }}
        >
          <div>Auth: {isLoading ? 'Loading...' : user ? `✅ ${user.username}` : '❌ Not logged in'}</div>
        </div>
      )}
    </TooltipProvider>
  );
}

export default App;
