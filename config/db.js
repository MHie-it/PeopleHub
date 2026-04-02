const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSEDB_CONNECTION);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to database:", error.message);
    }
};

module.exports = connectDB;