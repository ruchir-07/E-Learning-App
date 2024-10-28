const express = require("express")
const router = express.Router()
const { autherization, isStudent, isInstructor } = require("../middlewares/Autherization")
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateProfilePicture, 
  removeProfilePicture,
  getEnrolledCourses,
  instructorDashboard
} = require("../controllers/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

router.delete("/deleteProfile", autherization, deleteAccount);
router.put("/updateProfile", autherization, updateProfile);
router.get("/getUserDetails", autherization, getAllUserDetails);
router.put('/updateProfilePicture', autherization, updateProfilePicture);
router.delete('/removeProfilePicture', autherization, removeProfilePicture);
router.get('/getEnrolledCourses', autherization, getEnrolledCourses);
router.get("/instructorDashboard", autherization, isInstructor, instructorDashboard)

module.exports = router