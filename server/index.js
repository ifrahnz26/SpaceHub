const express = require('express');
const app = express();
const port = 5000;

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Hello World from SpaceHub Backend');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
