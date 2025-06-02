// src/pages/RoleBasedDashboard.jsx
import Dashboard from "./Dashboard";
import HodDashboard from "./HodDashboard";
import { useAuth } from "../context/AuthContext";

export default function RoleBasedDashboard() {
  const { user } = useAuth();

  if (user?.role === "HOD") {
    return <HodDashboard />;
  }
  return <Dashboard />;
}
