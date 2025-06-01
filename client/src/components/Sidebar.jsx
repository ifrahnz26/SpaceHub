import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) =>
    location.pathname === path ? "bg-white text-dark font-bold" : "";

  const showBookingLinks = user?.role !== "HOD" && user?.role !== "Venue Incharge";
  const isVenueIncharge = user?.role === "Venue Incharge";
  const isFacultyOrHOD = user?.role === "Faculty" || user?.role === "HOD";
  const isHOD = user?.role === "HOD";

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-dark text-white p-6 space-y-4">
      <h1 className="text-xl font-bold mb-6">🏫 University</h1>

      {/* ✅ Everyone sees Dashboard */}
      <Link
        to="/dashboard"
        className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/dashboard")}`}
      >
        Dashboard
      </Link>

      {/* ✅ Venue Schedule for Faculty and HOD */}
      {isFacultyOrHOD && (
        <>
          <Link
            to="/venue/schedule"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/venue/schedule")}`}
          >
            Venue Schedule
          </Link>
          <Link
            to="/venue/event-details"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/venue/event-details")}`}
          >
            Event Details
          </Link>
        </>
      )}

      {/* ✅ Venue Incharge specific links */}
      {isVenueIncharge && (
        <>
          <Link
            to="/venue/schedule"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/venue/schedule")}`}
          >
            Venue Schedule
          </Link>
          <Link
            to="/venue/update-schedule"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/venue/update-schedule")}`}
          >
            Update Schedule
          </Link>
          <Link
            to="/venue/update-event"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/venue/update-event")}`}
          >
            Update Event Info
          </Link>
          <Link
            to="/venue/event-details"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/venue/event-details")}`}
          >
            Event Details
          </Link>
        </>
      )}

      {/* ✅ Only Student & Faculty see booking links */}
      {showBookingLinks && (
        <>
          <Link
            to="/new-booking"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/new-booking")}`}
          >
            New Booking
          </Link>
          <Link
            to="/my-bookings"
            className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/my-bookings")}`}
          >
            My Bookings
          </Link>
        </>
      )}

      {/* ✅ HOD specific links (Analytics Dashboard) */}
      {isHOD && (
        <Link
          to="/analytics"
          className={`block px-2 py-2 rounded hover:bg-white hover:text-dark ${isActive("/analytics")}`}
        >
          Analytics Dashboard
        </Link>
      )}

      {/* ✅ Logout for all */}
      <button
        onClick={handleLogout}
        className="w-full text-left px-2 py-2 rounded hover:bg-white hover:text-dark"
      >
        Logout
      </button>
    </aside>
  );
}
