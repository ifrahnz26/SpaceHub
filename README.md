# SpaceHubBookings

A modern full-stack web application for managing college labs and seminar halls reservations. Built with React and Express, featuring a modern UI, real-time updates, and secure authentication.

## Features

- 🚀 Modern React frontend with Vite
- 🎨 Beautiful UI with Tailwind CSS and custom components
- 🔒 Secure authentication system
- 📊 Real-time data updates
- 📱 Responsive design


## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- React Query

### Backend
- Node.js
- Express
- WebSocket (ws)
- Passport.js for authentication

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd SpaceHubBookings
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:4500

## Project Structure

```
SpaceHubBookings/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Layout components
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Root component
│   │   └── main.jsx      # Entry point
├── server/                # Backend Express server
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── shared/               # Shared code between client and server
├── dist/                 # Production build output
└── scripts/              # Utility scripts

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Development Guidelines

### Code Style
- Use ESLint for code linting
- Follow the existing project structure
- Write meaningful commit messages

### Git Workflow
1. Create a new branch for your feature
2. Make your changes
3. Run tests and ensure linting passes
4. Submit a pull request

### CI/CD

The project uses GitHub Actions for continuous integration and deployment:
- Automated testing
- Linting checks
- Security audits
- Automated deployments to staging/production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/) 
