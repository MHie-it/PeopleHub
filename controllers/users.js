let userModel = require("../schemas/users");
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs')

module.exports = {
    CreateAnUser: async function (username, password, email, role, fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save();
        return newItem;
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false })
    },
    GetUserById: async function (id) {
        try {
            return await userModel
                .find({
                    isDeleted: false,
                    _id: id
                }).populate('role')
        } catch (error) {
            return false;
        }
    },
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        let user = await userModel.findOne({
            $or: [{ username: username }, { email: username }],
            isDeleted: false
        }).populate('role')
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                return jwt.sign({
                    id: user.id
                }, 'secret', {
                    expiresIn: '1d'
                })
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    ForgotPassword: async function (email) {
        // Find user by email
        let user = await userModel.findOne({ email: email, isDeleted: false });
        if (!user) {
            return { message: "Email not found" };
        }
        // In a real application, we would generate a token mapping to this user 
        // and send an email with the link. For now, we return a success message.
        return { message: "If the email is registered, a reset link will be sent." };
    },
    ChangePassword: async function (email, newPassword) {
        let user = await userModel.findOne({ email: email, isDeleted: false });
        if (!user) {
            return { message: "Email not found" };
        }
        user.password = newPassword;
        await user.save();
        return { message: "Password updated successfully" };
    }
}