const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const eventSchema = Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        data: Date,
        image: String,
        creator: {
            type: Schema.Types.ObjectId,
            ref:'User',
            required: true,
        },
    },
    { timestamps: true }

);


module.exports = mongoose.model("Event", eventSchema);