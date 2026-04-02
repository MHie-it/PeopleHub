const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');

const server = http.createServer(app);
server.listen(3030, async () => {
    console.log("Server listening on 3030 for testing...");
    
    try {
        // We need to make sure the db is connected and role "EMPLOYEE" exists
        const roleModel = require('./schemas/roles');
        let empRole = await roleModel.findOne({ name: 'EMPLOYEE' });
        if (!empRole) {
            await roleModel.create({ name: 'EMPLOYEE', description: 'employee role' });
            console.log("Created EMPLOYEE role");
        } else {
            console.log("EMPLOYEE role exists");
        }
        
        // 1. Test Register
        let email = `test_${Date.now()}@example.com`;
        let user = `user_${Date.now()}`;
        console.log("\n--- Testing Registration ---");
        let resReg = await fetch('http://localhost:3030/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                email: email,
                password: 'Password123!'
            })
        });
        let regData = await resReg.json();
        console.log("Status:", resReg.status, regData.username ? 'Success' : regData);
        
        // 2. Test Login
        console.log("\n--- Testing Login with email ---");
        let resLogin1 = await fetch('http://localhost:3030/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: email,
                password: 'Password123!'
            })
        });
        let loginData = await resLogin1.text();
        console.log("Status:", resLogin1.status, loginData.startsWith('ey') ? 'Token Received' : loginData);
        
        console.log("\n--- Testing Forgot Password ---");
        let resForgot = await fetch('http://localhost:3030/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email
            })
        });
        console.log("Status:", resForgot.status, await resForgot.json());
        
        console.log("\n--- Testing Change Password ---");
        let resChange = await fetch('http://localhost:3030/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: 'NewPassword123!'
            })
        });
        console.log("Status:", resChange.status, await resChange.json());
        
        console.log("\n--- Testing Login with new password ---");
        let resLogin2 = await fetch('http://localhost:3030/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                password: 'NewPassword123!'
            })
        });
        let loginData2 = await resLogin2.text();
        console.log("Status:", resLogin2.status, loginData2.startsWith('ey') ? 'Token Received' : loginData2);
        
    } catch(e) {
        console.error("Test Error:", e);
    } finally {
        server.close();
        await mongoose.disconnect();
        process.exit(0);
    }
});
