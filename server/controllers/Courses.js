const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const RatingAndReview = require('../models/RatingAndReview');
const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const CourseProgress = require('../models/CourseProgress');
const { convertSecondsToDuration } = require("../utils/secToDuration")
const {uploadImageToCloudinary} = require('../utils/imageUploader');
const { deleteImageFromCloudinary } = require('../utils/deleteImage');
require('dotenv').config();

//create course handler function
exports.createCourse = async (req, res)=>{
    try{
        //fetch data - data was stored in req.body during auth middleware
        let {
            courseName,
            courseDescription, 
            whatYouWillLearn, 
            price, 
            category, 
            tag, 
            instructions,
            status
        } = req.body;

        // Convert the tag and instructions from stringified Array to Array
        tag = JSON.parse(tag);
        instructions = JSON.parse(instructions);

        console.log("tag", tag);
        console.log("instructions", instructions);


        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail || !tag.length || !instructions.length){
            return res.status(400).json({
                success:false,
                message:'All fields are not present'
            });
        }

        //check the status
        if (!status || status === undefined) {
            status = "Draft"
        }

        //check for instructor (user id should also be stored in course's schema during new course creation to link it with an instructor)
        const userId = req.user.id;

        //check given tag is valid or not
        const categoryDetails = await Category.findById(category); //'tag' is an id bcoz 'tag' fetched from req's body was actually an id(referencing to actual tag)
        if(!categoryDetails){
            return  res.status(404).json({
                success: false,
                message: 'Category Details not found'
            });
        }

        //Upload image to cloudinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create and entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: userId,
            whatYouWillLearn,
            price,
            sold:0,
            tag,
            category:categoryDetails._id, //or simply 'tag' could be passed which was fetched from req's body
            thumbnail:thumbnailImage.secure_url,
            status: status,
            instructions
        });

        // add the new course to the user schema of instructor ( bcoz the user here is instructor and they don't need to buy the course they are uploading)
        await User.findByIdAndUpdate(
            {_id:userId},
            {
                $push: {
                    courses: newCourse._id
                }
            },
            {new: true}
        );

        //add the course to category
        await Category.findByIdAndUpdate(
            {_id:categoryDetails._id},
            {
                $push: {
                    courses: newCourse._id
                }
            },
            {new: true}
        )

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse
        });
    }
    catch(error){
        console.log('Error in creating courses ', error);
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )

            const Cloudinaryres = await deleteImageFromCloudinary(course.thumbnail ,process.env.FOLDER_NAME);
            console.log(Cloudinaryres);

            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
            } else {
            course[key] = updates[key]
            }
        }
        }

        await course.save()

        const updatedCourse = await Course.findOne({
        _id: courseId,
        })
        .populate({
            path: "instructor",
            populate: {
            path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
            path: "subSection",
            },
        })
        .exec()

        res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
        })
    } 
    catch (error) {
        console.error(error)
        res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
        })
    }
}

//fetch all courses handler function
exports.getAllCourses = async (req,res)=>{
    try {
        const allCourses = await Course.find({},{course:true,
                                                 price:true, 
                                                 thumbnail:true, 
                                                 instructor:true, 
                                                 ratingAndReview:true, 
                                                 studentEnrolled:true
                                                }
                                            ).populate('instructor').exec();
        
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses
        });
    }
    catch (error) {
        console.log('Error in getting all courses ', error);
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
            select: "-videoUrl",
          },
        })
        .exec()
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
      
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  // Get a list of Course for a given Instructor
  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 }).populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      });
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }
  // Delete the Course
  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            const subSection = await SubSection.findById(subSectionId);
            if(subSection){
                if(subSection.videoUrl){
                    await deleteImageFromCloudinary(subSection.videoUrl, process.env.FOLDER_NAME, "video")
                }

                //delete the subsection
                await SubSection.findByIdAndDelete({ _id: subSectionId });
            }
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
      
      await deleteImageFromCloudinary(course.thumbnail, process.env.FOLDER_NAME);

      await Category.findByIdAndUpdate(
        { _id: course?.category },
        { $pull: { courses: course._id } },
        { new: true }
      );

      // Delete the course
      await Course.findByIdAndDelete(courseId)

      await CourseProgress.deleteMany({ courseID: courseId });

      await RatingAndReview.deleteMany({ course: courseId });
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }


