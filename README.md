# 🏫Timora - University Venue Booking System

A role-based MERN stack web application for digital booking and management of university labs and seminar halls.

---

## 📌 Project Overview

This system allows students, faculty, venue incharges, and HODs to manage room bookings in a streamlined way.

### 👥 User Roles

- **Faculty**: Book venues, check slot availability.
- **Venue Incharge**: Block/unblock slots for regular classes, add event summaries.
- **HOD**: Approve or reject bookings for their department.

---

## 🛠 Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Passport.js (session-based)
- **Dev Tools**: Postman, GitHub

---

## 🚀 Getting Started

### 1️⃣ Clone the repo

```bash
git clone https://github.com/ifrahnz26/timora.git
cd university-booking-system
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 📁 Folder Structure

```
├── .git/
├── .github/
├── client/
│   ├── __tests__/
│   ├── build/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── BlockSlotsForm.jsx
│   │   │   ├── Carousel.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── __tests__/
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── HodDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── NewBooking.jsx
│   │   │   ├── RoleBasedDashboard.jsx
│   │   │   ├── UpdateEventDetails.jsx
│   │   │   ├── UpdateVenueSchedule.jsx
│   │   │   ├── VenueDashboard.jsx
│   │   │   └── VenueSchedule.jsx
│   │   ├── utils/
│   │   │   └── test-utils.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── index.js
│   │   └── setupTests.js
│   ├── Dockerfile
│   ├── .babelrc
│   ├── .gitignore
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   └── tailwind.config.js
├── node_modules/
├── postman/
│   ├── collection.json
│   └── environment.json
├── prometheus/
│   └── prometheus.yml
├── server/
│   ├── __tests__/
│   ├── uploads/
│   ├── scripts/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── events.js
│   │   ├── resources.js
│   │   └── users.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Event.js
│   │   ├── Resource.js
│   │   └── User.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── verifyToken.js
│   ├── controllers/
│   │   └── authController.js
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   ├── Dockerfile
│   ├── .babelrc
│   └── jest.config.cjs
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── package-lock.json
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in `/server`:

```
MONGO_URI=mongodb+srv://your-production-mongodb-uri
SESSION_SECRET=yourSecretKey
```

---

## 📚 API Endpoints

### Auth

- `POST /api/auth/login`
- `GET /api/auth/logout`

### Booking

- `POST /api/bookings`
- `GET /api/bookings/available-slots`
- `PATCH /api/bookings/:id/status`
- `PATCH /api/bookings/:id/summary`
- `PATCH /api/bookings/:id/update-event`
- `GET /api/bookings/my`
- `GET /api/bookings/hod`
- `GET /api/bookings/incharge`
- `POST /api/bookings/block`
- `DELETE /api/bookings/block/:id`

---

## 🧠 Features

- ✅ Role-based dashboards
- ✅ Slot conflict check
- ✅ Block/Unblock slots
- ✅ Add event summaries and metadata
- ✅ Conditional UI rendering based on role

---

## 📦 Future Enhancements

- 📊 Monthly analytics dashboard
- 📅 Calendar integration
- 📧 Email reminders
- 🧾 Export to CSV/PDF
- ☁️ Cloud deployment (Render/Vercel)

---

## 📸 UI Preview

_(Include screenshots or a Loom demo link here)_

---

## 👥 Contributors

- [Your Name / Team Name]

---

## 📃 License

This project is licensed under the MIT License.