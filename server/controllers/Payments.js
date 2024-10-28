const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mailTemplates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mailTemplates/paymentSuccessfullEmail")
const CourseProgress = require("../models/CourseProgress")

//Capture payment if more than 1 courses are needed to be bougth at a time. (whole cart at once)

//Step 1 :- creating order
//capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }

  let total_amount = 0;

  for (const course_id of courses) {
    let course;
    try {
      // Find the course by its ID
      course = await Course.findById(course_id);

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" });
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }

      // Add the price of the course to the total amount
      total_amount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};

// Step 2 - autherization
//Verify signature of Razorpay and Server
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;

  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res);
    return res.status(200).json({ success: true, message: "Payment Verified" });
  }

  return res.status(200).json({ success: false, message: "Payment Failed" });
};

const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please Provide Course ID and User ID",
      });
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId }, $inc: { sold: 1 } },
        { new: true }
      );      

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" });
      }
      console.log("Updated course: ", enrolledCourse);

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      console.log("Enrolled student: ", enrolledStudent);
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log("Email sent successfully: ", emailResponse.response);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
};

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }

//Capture payment if only 1 course needs to be bought at a time
/*
//Step 1 :- creating order
//capture the payment and initiate the razorpay order 
exports.capturePayment = async(req, res)=>{
    //get courseId and UserId
    const {courseId} = req.body;
    const userId = req.user.id;

    //validation
    // valid courseId 
    if(!courseId){
        return res.status(400).json({
            success:false,
            message: 'Please provide valid course ID'
        });
    }
    //valid courseDetails
    let course;
    try {
        course = await Course.findById(courseId);
        if(!course){
            return res.status(400).json({
                success:false,
                message:'Could not find the course'
            });
        }

        //if user already pay for the same course again
        const user_Id = new mongoose.Types.ObjectId(userId); //to convert userId from string to an Object ID
        if(course.studentsEnrolled.includes(user_Id)){
            return res.status(200).json({
                success:false,
                message:"Student already enrolled",
            });
        }
    } 
    catch (error) {
        console.log('Error in capture payment ', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }

    //order create
    const amount = course.price;
    const currency = 'INR';

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: courseId,
            userId,
        }
    };

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        //return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            current: paymentResponse.currency,
            amount: paymentResponse.amount
        });
        
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Could not initiate order'
        });
    }

}
*/

// Step 2 - autherization
//Verify signature of Razorpay and Server
// exports.verifyPayment = async(req,res)=>{
//     const webHookSecret = '12345678'; //Web hook secret provided by us for autherization

//     const signature = req.header('x-razorpay-signature');  //given by razorpay in header file, extracting it's value

//     //Now by performing this 3 step process to matchint the signature sent by razor pay above and creating our own signature
//     const shasum = crypto.createHmac('sha256', webHookSecret);  //creating hashing object with algo sha256 and webhookSecret
//     shasum.update(JSON.stringify(req.body)); //passing string to shasum
//     const digest = shasum.digest('hex'); // digesting shasum

//     if(signature === digest){ //if both are equal then signature sent by razorpay is an autherized signature for current uter
//         console.log('Payment is authorized');

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//             //fulfill the action

//             //find the course and enroll the student in it
//             const enrolledCourse = await Course.findOneAndUpdate(
//                                             {_id: courseId},
//                                             {
//                                                 $push: {studentsEnrolled: userId},
//                                                 $inc: {sold: 1}
//                                             },
//                                             {new:true}
//             );

//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success:false,
//                     message:'Course not Found',
//                 });
//             }

//             console.log(enrolledCourse);

//             //find the student and add the course to their list enrolled courses
//             const enrolledStudent = await User.findOneAndUpdate(
//                                             {_id: userId},
//                                             {$push: {courses: courseId}},
//                                             {new: true}
//             );
//             console.log(enrolledStudent);
//             if(!enrolledStudent){
//                 return res.status(500).json({
//                     success:false,
//                     message:'Student not Found',
//                 });
//             }

//             //mail send confirmation
//             const emailResponse = await mailSender(
//                                     enrolledStudent.email,
//                                     'Congratulation from StudeCraze',
//                                     'Congratulations, you are onboarded into new StudyCraze Course',

//             );

//             console.log(emailResponse);
//             return res.status(200).json({
//                 success: true,
//                 message:'Signature Verified and Course Added',
//             });

//         }
//         catch(error){
//             console.error('Error in matching Signature ', error);
//             return res.status(400).json({
//                 success:false,
//                 message: error.message
//             });
//         }
//     }
//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request'
//         });
//     }
// };
