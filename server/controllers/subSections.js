const subSection = require('../models/SubSection');
const Section = require('../models/Section');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
const {deleteImageFromCloudinary} = require('../utils/deleteImage');
require('dotenv').config();

//create Subsection
exports.createSubSection = async (req, res) =>{
    try{
        // fetch data from req body
        const {sectionId, title, description} = req.body;

        //extract file/video
        const video = req.files.video;

        //validation
        if(!sectionId || !title || !description || !video){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            });
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        //create a subsection
        const subsectionDetails = await subSection.create({
            title:title,
            timeDuration:`${uploadDetails.duration}`,
            description:description,
            videoUrl: uploadDetails.secure_url
        });

        //update section with this sub section objectId
        const updatedSection = await Section.findByIdAndUpdate(
                {_id:sectionId},
                {
                    $push:{
                        subSection: subsectionDetails._id,
                    }
                },
                {new:true}
            ).populate('subSection').exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"Sub section created successfully",
            updatedSection
        });
    }   
    catch(error){
        console.log("Error in creating subsection ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

//Hw: Update subsection 
exports.updateSubSection = async (req, res) => {
    try {
    
        const { sectionId, subSectionId, title, description } = req.body;
        const subsection = await subSection.findById(subSectionId);
      if (!subsection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        });
      }
  
      if (title !== undefined) {
        subsection.title = title;
      }
  
      if (description !== undefined) {
        subsection.description = description;
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video;
        //upload new video
        const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
        );
        
        //delete the older video from cloudinary
        await deleteImageFromCloudinary(subsection.videoUrl, process.env.FOLDER_NAME, 'video');

        subsection.videoUrl = uploadDetails.secure_url;
        subsection.timeDuration = `${uploadDetails.duration}`;
      }
  
      await subsection.save();
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      ).exec();
  
    //   console.log("updated section", updatedSection);
  
      return res.json({
        success: true,
        message: "Section updated successfully",
        updatedSection,
      });
    } catch (error) {
      console.error('Error in updating Subsection');
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

//Hw: delete subsection
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                subSection: subSectionId,
                },
            },
            {new:true}
        );

        //delete the video from cloudinary
        const subsection = await subSection.findById(subSectionId);
        if (!subsection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found" 
            });
        }
        await deleteImageFromCloudinary(subsection.videoUrl, process.env.FOLDER_NAME, 'video');

        //delete the subsection
        await subSection.findByIdAndDelete({ _id: subSectionId });

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate("subSection").exec();

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
        });
    } 
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        });
    }
};