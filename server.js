const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${port}`);
});
