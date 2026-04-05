let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token || !token.startsWith("Bearer")) {
                res.status(403).send({ message: "ban chua dang nhap" })
                return;
            }
            token = token.split(' ')[1]
            let result = jwt.verify(token, 'secret');
            if (result.exp * 1000 < Date.now()) {
                res.status(403).send({ message: "ban chua dang nhap" })
                return;
            }
            let getUser = await userController.GetUserById(result.id);
            if (!getUser) {
                res.status(403).send({ message: "ban chua dang nhap" })
            } else {
                req.user = getUser;
                next();
            }
        } catch (error) {
            res.status(403).send({ message: "ban chua dang nhap o day" })
        }

    },
    CheckRole: function (roles) {
        return function (req, res, next) {
            try {
                if (!req.user || req.user.length === 0) {
                    return res.status(403).send({ message: "ban chua dang nhap" });
                }

                                let userRole = req.user[0].role;
                if (!userRole || !roles.includes(userRole.name)) {
                    return res.status(403).send({ message: "ban khong co quyen truy cap" });
                }
                next();
            } catch (error) {
                res.status(500).send({ message: "loi xac thuc quyen" });
            }
        }
    }
}