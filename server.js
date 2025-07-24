const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// For simplicity, serving static html - can add API routes later here

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
