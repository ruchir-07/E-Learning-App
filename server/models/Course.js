const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName:{
        type: String,
        requried: true,
        trim: true
    },
    courseDescription: {
        type: String,
        trim: true
    },
    instructor: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    whatYouWillLearn: {
        type: String,
        trim: true,
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    ratingAndReviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "RatingAndReview",
		},
	],
    price:{
        type: Number,
        required: true,
        trim: true,
    },
    sold: {
        type: Number
    },
    thumbnail:{
        type: String
    },
    tag:{
        type: [String],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref: "User"
        }
    ],
    instructions: {
		type: [String],
	},
	status: {
		type: String,
		enum: ["Draft", "Published"],
	},
	createdAt: {
		type:Date,
		default:Date.now()
	}
});

module.exports = mongoose.model("Course", courseSchema);