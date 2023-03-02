const express = require('express');
const router = express.Router();
const authRouter = require('../controllers/authController.js');
const { body } = require("express-validator");
const User = require('../models/user');
const isAuth=require('../utils/isAuth')

router.post("/signup",
    [
        body("email").isEmail()
            .withMessage("please enter valid email")
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            console.log("user",user);
                            return Promise.reject("this Email is exits");
                        }
                    })
                    .catch(err => console.log(err))
            }),
        body('password').trim()
    ]
    , authRouter.signup);


router.post("/login",
    [
        body("email").isEmail()
            .withMessage("please enter valid email"),
        body('password').trim()
    ]
    , authRouter.login);
    



module.exports = router;