let mongoose = require('mongoose');


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSEDB_CONNECTION);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
};

module.exports = connectDB;