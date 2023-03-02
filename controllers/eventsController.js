const { validationResult } = require("express-validator");
const Event = require('../models/event');
const path = require('path');
const User = require("../models/user");
const io = require("../socket");


exports.getEvent = async (req, res, next) => {
    const itemPage = 30;
    let numPages;
    const page = req.query.page || 1;
    try {
        let events = await Event.find();
        numPages = Math.ceil(events.length / itemPage);
        events = await Event.find()
            .skip((page - 1) * itemPage)
            .limit(itemPage);

        if (!events) {
            const error = new Error(" No Found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "success",
            numPages: numPages,
            currentPage: page,
            length: events.length,
            event: events,
        });
    }

    catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    };
};

exports.postEvent = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Verify the data you entered");
        error.statusCode = 422;
        throw error;
    }
    if (req.file) {
        const image = req.file.path;
    };
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    const creator = req.user.userId;
    try {
        const event = new Event({
            title: title,
            description: description,
            date: date,
            createdAt: new Date(),
            creator: creator,
        });
        const result = await event.save();
        const user = await User.findById(req.user.userId);
        user.event.push(event);
        await user.save();
        io.getIo().emit("events", {
            action: "create",
            event: {
                ...event._doc,
                creator: { _id: req.user.userId, name: req.user.name }
            }
        });
        res.status(201).json({
            message: "success creation event",
            event: event,
        })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

    
};

exports.getEventById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const event = await Event.findById(id);
        if (!event) {
            const error = new Error(" No Found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "success",
            event: event,
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateEvent = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Verify the data you entered");
        error.statusCode = 422;
        throw error;
    }

    if (req.file) {
        const image = req.file.path;
    }

    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    
    try {
        const event = await Event.findById(id);
        if (!event) {
            const error = new Error("No  Event Found");
            error.statusCode = 404;
            throw error;
        };
        console.log("req.user,userid : ", req.user.userId);
        console.log("event.creator.toString() : ", event.creator.toString());
        if (event.creator.toString() !== req.user.userId) {
            const error = new Error("NOT AUTHORIZED");
            error.statusCode = 403;
            throw error;
        }
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                title: title,
                description: description,
                date: date,
                createdAt: new Date(),
            },
            {
                new: true,
                runValidator: true,
            }
        );
        io.getIo().emit("events", {
            action: "update",
            event: updatedEvent,
        });
        res.status(201).json({
            message: "success updated event",
            event: updatedEvent,
        });
    } catch (err) {
        if (!err.statusCode) {
            ;
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.deleteEvent = async (req, res, next) => {
    const id = req.params.id;
    try {
        const event = await Event.findByIdAndDelete(id);
        const user = await User.findById(req.user.userId);
        user.event.pull(id);
        await user.save();

        io.getIo().emit("events", {
            action: "delete",
            event: id,
        });

        res.status(201).json({
            message: "success deleted event",
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};




const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}
