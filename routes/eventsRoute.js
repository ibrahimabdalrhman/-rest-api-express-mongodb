const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../utils/isAuth");
const eventController = require('../controllers/eventsController');

router.get('/events',  eventController.getEvent);


router.get("/events/:id", eventController.getEventById);


router.post(
    "/events",
    isAuth, [
    (body("title").trim().isLength({ min: 2 }),
        body("description").trim().isLength({ min: 2 }))
    ],
    eventController.postEvent
);

    
router.patch(
    "/events/:id",
    isAuth, [
    (body("title").trim().isLength({ min: 2 }),
        body("description").trim().isLength({ min: 2 }))
    ],
    eventController.updateEvent
);


router.delete("/events/:id",isAuth, eventController.deleteEvent);



module.exports = router;