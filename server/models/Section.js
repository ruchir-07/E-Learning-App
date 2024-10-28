const mongoose = require('mongoose');
const Section = new mongoose.Schema({

    sectionName: {
        type: String,
        trim: true,
        required: true
    },
    subSection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"SubSection"
        }
    ]

});

module.exports = mongoose.model("Section", Section);