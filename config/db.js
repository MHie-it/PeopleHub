let mongoose = require('mongoose');
let dotenv = require('dotenv');
let fs = require('fs');
let path = require('path');

function loadEnv() {
    // Project đang dùng file `.evn` (không phải `.env`), nên load thủ công theo cả 2 trường hợp.
    const envPath = path.resolve(__dirname, '..', '.env');
    const envPathAlt = path.resolve(__dirname, '..', '.evn');

    if (fs.existsSync(envPathAlt) && !fs.existsSync(envPath)) {
        dotenv.config({ path: envPathAlt });
    } else {
        dotenv.config({ path: envPath });
    }
}

const connectDB = async () => {
    loadEnv();

    const uri = process.e~nv.MONGOOSEDB_CONNECTION;
    if (!uri) {
        console.error(
            'Missing `MONGOOSEDB_CONNECTION` in env file. Expected `.env` (or `.evn`) at project root.'
        );
        return;
    }

    try {
        await mongoose.connect(uri);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};

module.exports = connectDB;