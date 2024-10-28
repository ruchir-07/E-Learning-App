const User = require('../models/User');
const RatingAndReview = require('../models/RatingAndReview')
const Profile = require('../models/Profile');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const mongoose = require('mongoose');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const { deleteImageFromCloudinary } = require('../utils/deleteImage');
const { convertSecondsToDuration } = require("../utils/secToDuration")
require('dotenv').config();

//We have already created profile details during sign up in Authentication controller and have set all details to null. so there is no need for a 'createProfile' function.

//update Profile
exports.updateProfile = async(req, res) =>{
    try{
        //fetch data
        const {firstName, lastName, dateOfBirth="", about="", contactNumber="", gender=""} = req.body; //dataOfBirth="" means fetching dateofbirth,if no value assigned then assign an empty value

        //get userId
        const id = req.user.id;
        if(!firstName || !lastName){
            return res.status(400).json({
                success:false,
                message: 'firstName and lastName is required'
            })
        }

        //validation - atleast one field is required
        if(!contactNumber && !gender && !about && !dateOfBirth){
            return res.status(400).json({
                success:false,
                message:'All fields are empty, atleast 1 field is required',
            });
        }

        //find Profile
        const userDetails = await User.findById(id);

        userDetails.firstName = firstName;
        userDetails.lastName = lastName;
        await userDetails.save();

        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //Update Profile
     
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save(); //for saving already created object into DB

        const user = await User.findById(id).populate('additionalDetails');

        //return response
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            user
        });
    }
    catch(error){
        console.log('Error in updating profile ', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//delete Account 
// HW: here we have to apply task scheduling, bcoz we don't want to delete an account as soon as we get a delete request
// HW: study term 'CroneJob'
exports.deleteAccount = async (req, res)=>{
    try{
        // get id
        const id = req.user.id;

        // validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }
        //delete user image from cloudinary
        if(userDetails.image){
            const Cloudinaryres = await deleteImageFromCloudinary(userDetails.image ,process.env.FOLDER_NAME);
            // console.log(Cloudinaryres);
        }

        //delete profile
        await Profile.findByIdAndDelete({
            _id: new mongoose.Types.ObjectId(userDetails.additionalDetails)
        });

        // unenroll user from all enrolled courses
        for (const courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(
              courseId,
              { $pull: { studentsEnrolled: id } },
              { new: true }
            );
        }

        //delete user
        await User.findByIdAndDelete({_id:id});

        //delete course Progress
        await CourseProgress.deleteMany({userId: id});

        const ratings = await RatingAndReview.find({ user: id });
        // console.log('ratings fetched', ratings);
        for (let i = 0; i < ratings.length; i++) {
            const course = await Course.findById(ratings[i]?.course);
            // console.log('course', course);
            const RatingId = ratings[i]?._id;
            // console.log('ratingId',RatingId)
        
            const res = await Course.findOneAndUpdate(
                { _id: course?._id },
                { $pull: { ratingAndReviews: RatingId } },
                { new: true }
            );
            // console.log('res',res);
        }

        //delete RatingAndReview by user
        await RatingAndReview.deleteMany({ user: id });

        // return response
        return res.status(200).json({
            success:true,
            message: 'Account deleted Successfully'
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully'
        });
    }
};

exports.getAllUserDetails = async (req, res)=>{
    try{
        //get id
        const id = req.user.id;

        //validation 
        if(!id){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        //get user details
        const userDetails = await User.findById(id).populate('additionalDetails').exec();

        // return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched successfully',
            userDetails
        });

    }
    catch(error){
        console.log('Error in fetching all users ', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.updateProfilePicture = async(req, res)=>{
    try{
        //fetch data
        const profilePicture = req.files.displayPicture;
        const userId = req.user.id;

        //validation
        const supportedTypes = ['jpg', 'jpeg', 'png'];
        const fileType = profilePicture.name.split('.')[1].toLowerCase();
        //if file formated is not supported
        if(!supportedTypes.includes(fileType)){
            return res.json({
                success: false,
                message: 'File format not supported'
            });
        }
        
        //file Upload
        const image = await uploadImageToCloudinary(
            profilePicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );
        console.log(image);
        
        if(req.user.image && req.user.image.includes('cloudinary')){
            const Cloudinaryres = await deleteImageFromCloudinary(req.user.image ,process.env.FOLDER_NAME);
            console.log(Cloudinaryres);
        }

        //url update in DB
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        );

        //return response
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        });
    }
    catch(error){
        console.log('Error in updating Profile picture', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.removeProfilePicture = async(req, res)=>{
    try{
        //fetch id
        const userId = req.user.id;
        
        //get user details
        const userDetails = await User.findById(userId);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }
        //delete user image from cloudinary
        if(userDetails.image){
            const  response = await deleteImageFromCloudinary(userDetails.image ,process.env.FOLDER_NAME);
            console.log(response);
        }

        userDetails.image = `https://api.dicebear.com/5.x/initials/svg?seed=${userDetails.firstName}+${userDetails.lastName}`;
        await userDetails.save();

        res.json({
            success: true,
            message: 'User image is removed successfully',
            user: userDetails
        });
    }
    catch(error){
        console.log('Error in removing Profile picture', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }