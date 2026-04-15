var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let userModel = require('../schemas/users')
let roleModel = require('../schemas/roles')
let { RegisterValidator, validatedResult, ForgotPasswordValidator, ResetPasswordValidator } = require('../utils/validator')
let { CheckLogin, CheckRole } = require('../utils/authHandler')


router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username, password);
    if (!result) {
        res.status(404).send("thong tin dang nhap khong dung")
    } else {
        res.send(result)
    }
})

router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {
    let { username, password, email } = req.body;
    let employeeRole = await roleModel.findOne({ name: 'Employee' });
    if (!employeeRole) {
        return res.status(500).send({ message: "Default role (Employee) not found in database" });
    }
    let newUser = await userController.CreateAnUser(
        username, password, email, employeeRole._id
    )
    res.send(newUser)
})

router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user)
})

// Update own profile (fullName, email)
router.patch('/me', CheckLogin, async function (req, res, next) {
    try {
        let userDoc = req.user && req.user[0];
        if (!userDoc || !userDoc._id) {
            return res.status(403).json({ message: "Chua dang nhap" });
        }

        let { fullName, email } = req.body;
        let updateFields = {};
        if (fullName !== undefined) updateFields.fullName = fullName.trim();
        if (email !== undefined) updateFields.email = email.trim().toLowerCase();

        let updatedUser = await userModel
            .findByIdAndUpdate(userDoc._id, updateFields, { new: true })
            .select('-password')
            .populate('role');

        if (!updatedUser) {
            return res.status(404).json({ message: "Khong tim thay user" });
        }

        return res.status(200).json({ data: updatedUser });
    } catch (error) {
        return res.status(500).json({ message: "Loi server", error: error.message });
    }
})

router.post('/forgot-password', ForgotPasswordValidator, validatedResult, async function (req, res, next) {
    let { email } = req.body;
    let result = await userController.ForgotPassword(email);
    res.send(result)
})

router.post('/change-password', ResetPasswordValidator, validatedResult, async function (req, res, next) {
    let { email, password } = req.body;
    let result = await userController.ChangePassword(email, password);
    res.send(result)
})

module.exports = router;