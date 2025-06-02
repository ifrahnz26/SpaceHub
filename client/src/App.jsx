import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewBooking from "./pages/NewBooking";
import MyBookings from "./pages/MyBookings";
import VenueDashboard from "./pages/VenueDashboard";
import VenueSchedule from "./pages/VenueSchedule";
import UpdateVenueSchedule from "./pages/UpdateVenueSchedule";
import UpdateEventDetails from "./pages/UpdateEventDetails";
import EventDetails from "./pages/EventDetails";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Layout from "./components/Layout";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      
      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* HOD Routes (Analytics Dashboard) */}
        {user && user.role === "HOD" && (
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        )}

        {/* Student & Faculty Routes */}
        {user && (user.role === "Student" || user.role === "Faculty") && (
          <>
            <Route path="/new-booking" element={<NewBooking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </>
        )}

        {/* Venue Incharge Routes */}
        {user && user.role === "Venue Incharge" && (
          <>
            <Route path="/venue/dashboard" element={<VenueDashboard />} />
            <Route path="/venue/schedule" element={<VenueSchedule />} />
            <Route path="/venue/update-schedule" element={<UpdateVenueSchedule />} />
            <Route path="/venue/update-event" element={<UpdateEventDetails />} />
            <Route path="/venue/event-details" element={<EventDetails />} />
          </>
        )}

        {/* Faculty and HOD Routes */}
        {user && (user.role === "Faculty" || user.role === "HOD") && (
          <>
            <Route path="/venue/schedule" element={<VenueSchedule />} />
            <Route path="/venue/event-details" element={<EventDetails />} />
          </>
        )}

        {/* Redirect to dashboard if no matching route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  );
}

// Main App component that wraps everything with providers
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
