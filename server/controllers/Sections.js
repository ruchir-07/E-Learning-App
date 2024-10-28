const Course = require('../models/Course');
const Section = require('../models/Section');
const subSection = require('../models/SubSection');
const { deleteImageFromCloudinary } = require('../utils/deleteImage');
require('dotenv').config();

exports.createSection = async (req, res)=>{
    try {
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section ObjectID
        const updatedCourse = await Course.findByIdAndUpdate(
                                                courseId,
                                                {
                                                    $push:{
                                                        courseContent:newSection._id
                                                    }
                                                },
                                                {new:true}
                                            ).populate({
                                                path: "courseContent",
                                                populate: {
                                                    path: "subSection",
                                                },
                                            })
                                            .exec();
                                            
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourse,
        });
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:'Unable to create Section, try again',
            error: error.message
        })
    }
}

//update section
exports.updateSection = async (req, res)=>{
    try {
        //data fetch
        const {sectionName, sectionId, courseId} = req.body;

        const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const updatedCourse = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: section,
			updatedCourse,
		});
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:'Unable to update Section, try again',
            error: error.message
        });
    }
};

//delete section
exports.deleteSection = async (req, res)=>{
    try{

        //get Id
        const {sectionId, courseId} = req.body;
        
        const section = await Section.findById(sectionId);
        if(!section){
            return res.status(404).json({
                success:false,
                message:"Section not found, please try again",
            });
        }
        
        //delete cloudinary videos of subsections
        const subSectionsToDelete = section.subSection;
        
        for(const subSectionId of subSectionsToDelete){
            const subsection = await subSection.findById(subSectionId);
            await deleteImageFromCloudinary(subsection.videoUrl, process.env.FOLDER_NAME, 'video');
        }
        
        //delete sub sections
		await subSection.deleteMany({_id: {$in: section.subSection}});

        //delete the section
        await Section.findByIdAndDelete(sectionId);

        //delete section id from course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId, 
            {
                $pull: {
                    courseContent: sectionId,
                }
            },
            {new: true}
		).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
            updatedCourse
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error: error.message
        });
    }
};