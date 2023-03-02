const User=require('../models/user.js')
const { validationResult }=require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        const error = new Error('invalid data .');
        const statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const status = "active";
    try {
        const hashedPasword = await bcrypt.hash(password, 12);
        const newUser = new User({
            email: email,
            username: username,
            name: name,
            password: hashedPasword,
            status: status,
        });
        const user = await newUser.save();
        res.status(201).json({
            message: 'user created successfully',
            user: user,
        });
    } catch (err) { console.log(err) };

};


exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("Not Found ");
            error.statusCode = 401;
            throw error;
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            const error = new Error("wrong password !");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: user.email,
                name: user.name,
                userId: user._id.toString(),
            },
            "secret",
            { expiresIn: "24h" }
        );
        res.status(200).json({
            token
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};