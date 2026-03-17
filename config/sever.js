const express = require('express');
const connectDB = require('./db');

const app = express();

// Connect to the database
connectDB();

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});