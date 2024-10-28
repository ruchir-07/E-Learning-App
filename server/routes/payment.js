// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail} = require("../controllers/Payments")
const { autherization, isInstructor, isStudent, isAdmin } = require("../middlewares/Autherization")
router.post("/capturePayment", autherization, isStudent, capturePayment)
router.post("/verifyPayment",autherization, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", autherization, isStudent, sendPaymentSuccessEmail);

module.exports = router