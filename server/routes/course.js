// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  editCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  getInstructorCourses,
  deleteCourse
} = require("../controllers/Courses");


// Categories Controllers Import
const {
  showAllCategory,
  createCategory,
  categoryPageDetails
} = require("../controllers/Category")

// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Sections")

// Sub-Sections Controllers Import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/subSections")

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReviews")

const {
  updateCourseProgress
} = require("../controllers/courseProgress");

// Importing Middlewares
const { autherization, isInstructor, isStudent, isAdmin } = require("../middlewares/Autherization")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", autherization, isInstructor, createCourse);
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)

//Add a Section to a Course
router.post("/addSection", autherization, isInstructor, createSection)
// Update a Section
router.post("/updateSection", autherization, isInstructor, updateSection)
// Delete a Section
router.delete("/deleteSection", autherization, isInstructor, deleteSection)

// Add a Sub Section to a Section
router.post("/addSubSection", autherization, isInstructor, createSubSection)
// Edit Sub Section
router.post("/updateSubSection", autherization, isInstructor, updateSubSection)
// Delete Sub Section
router.delete("/deleteSubSection", autherization, isInstructor, deleteSubSection)

// Get Details for a Specific Courses
router.post("/getFullCourseDetails", autherization, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", autherization, isInstructor, editCourse)
// // Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", autherization, isInstructor, getInstructorCourses)
// // Delete a Course
router.delete("/deleteCourse", deleteCourse)

router.post("/updateCourseProgress", autherization, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
router.post("/createCategory", autherization, isAdmin, createCategory);
router.post("/createCategory", createCategory);
router.get("/showAllCategories", showAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", autherization, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router