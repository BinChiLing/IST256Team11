const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;
const publicDirectory = path.join(__dirname, 'public');

// Serve static files
app.use(express.static(publicDirectory));

// Enable CORS for all origins
app.use(cors());

// Route for serving games.json
app.get('/data/games.json', (req, res) => {
    const filePath = path.join(publicDirectory, 'data', 'games.json');
    serveStaticFile(filePath, 'application/json', res);
});

// Function to serve static files
function serveStaticFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).type(contentType).send(data);
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
