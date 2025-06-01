import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import campusBg from "../assets/images/college.jpg";
import computerLabImg from "../assets/images/resources/computer-lab.avif";
import seminarHallImg from "../assets/images/resources/seminar-hall.avif";

export default function Login() {
  const [role, setRole] = useState("");
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "CSE",
    role: "",
    assignedVenueId: "",
  });

  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/resources");
        const data = await res.json();
        if (res.ok) setVenues(data);
      } catch (err) {
        console.error("Failed to fetch venues:", err);
      }
    };

    if (role === "Venue Incharge" && tab === "register") {
      fetchVenues();
    }
  }, [role, tab]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint =
      tab === "login"
        ? "http://localhost:5001/api/auth/login"
        : "http://localhost:5001/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (res.ok) {
        if (tab === "login" && data.token && data.user) {
          localStorage.setItem("token", data.token);
          login(data.user);
          navigate("/dashboard");
        } else {
          alert(data.message || "Registered successfully");
        }
      } else {
        alert(data.error || "Login/Register failed");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="text-dark font-sans scroll-smooth">
      {/* Hero Header */}
      <section className="bg-dark text-white min-h-[60vh] p-6 flex flex-col justify-between relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={campusBg}
            alt="Campus Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark/70"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary">
              Timora
            </h1>
            <nav className="space-x-6 text-sm font-medium">
              <a href="#about" className="hover:text-primary">About</a>
              <a href="#resources" className="hover:text-primary">Resources</a>
              <a href="#contact" className="hover:text-primary">Contact</a>
            </nav>
          </div>

          <div className="mt-16 max-w-3xl">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Campus Resource <br /> Booking Made Simple
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Streamline your academic space reservations with our easy-to-use booking platform for labs and seminar halls.
            </p>
            <a href="#login" className="inline-block bg-white text-dark font-semibold px-5 py-2 rounded hover:bg-gray-200">
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="login" className="mt-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">Login to Your Account</h2>
        <div className="flex justify-center gap-8 flex-wrap">
          {[
            { 
              label: "Venue Incharge", 
              icon: "🏢", 
              description: "Manage and oversee venue operations. Review booking requests, ensure proper resource allocation, and maintain venue schedules. Coordinate with faculty and staff for smooth event execution.",
              features: ["Review booking requests", "Manage venue schedules", "Coordinate events", "Resource allocation"]
            },
            { 
              label: "Faculty", 
              icon: "👨‍🏫", 
              description: "Access and book academic spaces for teaching and research. Schedule classes, workshops, and departmental events. View venue availability and manage your bookings efficiently.",
              features: ["Book venues", "Schedule classes", "Manage bookings", "View availability"]
            },
            { 
              label: "HOD", 
              icon: "👨‍💼", 
              description: "Oversee department-wide resource allocation. Approve booking requests, monitor usage patterns, and ensure optimal utilization of academic spaces within your department.",
              features: ["Approve bookings", "Monitor usage", "Department oversight", "Resource planning"]
            },
          ].map((r) => (
            <div key={r.label} className="bg-white border shadow-lg rounded-xl w-80 p-6 text-center">
              <div className="bg-dark text-white text-3xl py-6 rounded-t-xl">{r.icon}</div>
              <h3 className="font-semibold mt-4 text-lg">{r.label} Login</h3>
              <p className="text-sm text-gray-600 mb-4">{r.description}</p>
              <ul className="text-sm text-gray-500 mb-4 text-left">
                {r.features.map((feature, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <span className="text-primary mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setRole(r.label)}
                className="bg-accent text-white px-4 py-2 rounded hover:bg-pink-700"
              >
                Login as {r.label}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Login/Register Form */}
      {role && (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 border shadow rounded-lg p-6">
          <div className="flex justify-center mb-4">
            <button
              type="button"
              className={`w-1/2 px-4 py-2 ${tab === "login" ? "bg-gray-100 font-semibold" : ""}`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`w-1/2 px-4 py-2 ${tab === "register" ? "bg-gray-100 font-semibold" : ""}`}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          <h2 className="text-lg font-bold mb-4">{tab === "login" ? "Login" : "Register"} to your account</h2>

          {tab === "register" && (
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full mb-4"
              required
            >
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ISE">Information Science (ISE)</option>
              <option value="AIML">Artificial Intelligence (AIML)</option>
            </select>
          )}

          {tab === "register" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded mb-3"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded mb-4"
          />

          {tab === "register" && role === "Venue Incharge" && (
            <select
              name="assignedVenueId"
              value={form.assignedVenueId}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full mb-4"
              required
            >
              <option value="">Select Assigned Venue</option>
              {venues.map((venue) => (
                <option key={venue._id} value={venue._id}>
                  {venue.name} - {venue.type}
                </option>
              ))}
            </select>
          )}

          <div className="bg-blue-100 text-sm text-gray-700 p-3 rounded mb-4">
            <strong>Test Accounts:</strong><br />
            Faculty: faculty@test.com / password123<br />
            Venue Incharge: incharge@test.com / password123<br />
            HOD: hod@test.com / password123
          </div>

          <button type="submit" className="bg-dark text-white w-full py-2 rounded mb-2">
            {tab === "login" ? "Sign In" : "Register"}
          </button>
        </form>
      )}

      {/* Resources Section */}
      <section id="resources" className="mt-20 px-6">
        <h2 className="text-2xl font-bold text-center mb-10">Our Resources</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto justify-center">
          {[
            {
              title: "Computer Labs",
              desc: "State-of-the-art computer labs equipped with high-performance workstations, latest software suites, and high-speed internet connectivity. Perfect for programming, research, and project work.",
              img: computerLabImg,
            },
            {
              title: "Seminar Halls",
              desc: "Modern seminar halls with advanced audio-visual equipment, comfortable seating, and climate control. Ideal for presentations, workshops, guest lectures, and departmental events.",
              img: seminarHallImg,
            },
          ].map((card) => (
            <div key={card.title} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img src={card.img} alt={card.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-gray-600">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="mt-20 bg-dark text-white py-8">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="text-lg font-bold text-primary">Timora</h3>
            <p className="mt-2">Ramaiah Institute of Technology's official resource booking platform. Streamlining academic space management for better learning experiences.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="#">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#resources">Resources</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Contact Us</h4>
            <div className="space-y-1">
              <p>Ramaiah Institute of Technology</p>
              <p>MSR Nagar, MSRIT Post</p>
              <p>Bangalore - 560 054</p>
              <p>Karnataka, India</p>
              <p className="mt-2">Email: support@msrit.edu</p>
              <p>Phone: +91 80 2360 0888</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}