const mongoose = require("mongoose");
let dotenv = require('dotenv');
dotenv.config();

const User = require("./schemas/users");
const Role = require("./schemas/roles");
const Department = require("./schemas/department");
const Position = require("./schemas/positions");
const Employee = require("./schemas/employees");
const Payroll = require("./schemas/payrolls");
const Notifi = require("./schemas/notifi");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGOOSEDB_CONNECTION);
        console.log("Connected DB");

        const rnd = Date.now();
        // 1. Role
        let role = await Role.findOne({ name: "Employee" });
        if (!role) {
            role = await Role.create({ name: "Employee", description: "Employee role" });
        }

        // 2. User
        const user = await User.create({ 
            username: "user" + rnd, 
            password: "123", 
            email: "nvtest@peoplehub.com", 
            role: role._id 
        });

        // 3. Department
        const dept = await Department.create({ 
            code: "D" + rnd, 
            name: "Phòng Nhân Sự " + rnd 
        });

        // 4. Position
        const pos = await Position.create({ 
            code: "P" + rnd, 
            title: "Chuyên viên NS", 
            department: dept._id 
        });

        // 5. Employee
        const emp = await Employee.create({
            employeeCode: "EMP" + rnd,
            user: user._id,
            fullName: "Nguyễn Văn Test",
            joinDate: new Date(),
            department: dept._id,
            position: pos._id
        });

        // 6. Payroll
        const payroll = await Payroll.create({
            employee: emp._id,
            month: 4,
            year: 2026,
            workingDays: 22,
            baseSalary: 15000000,
            bonus: 2000000,
            penalty: 500000,
            totalSalary: 16500000
        });

        // 7. Notification
        const noti = await Notifi.create({
            receiver: user._id,
            title: "Lương tháng mới",
            message: "Bạn đã có bảng lương tháng 4/2026",
            type: "SYSTEM"
        });

        console.log("=== THÔNG TIN TEST TẠO THÀNH CÔNG ===");
        console.log("USER_ID:", user._id.toString());
        console.log("PAYROLL_ID:", payroll._id.toString());
        console.log("NOTIFI_ID:", noti._id.toString());
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
