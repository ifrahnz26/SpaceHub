// Simple wrapper to start the JavaScript server
console.log('Starting server...');
process.env.NODE_ENV = 'development';
import('./server/index.js')
  .then(() => console.log('Server started successfully'))
  .catch(err => console.error('Error starting server:', err));