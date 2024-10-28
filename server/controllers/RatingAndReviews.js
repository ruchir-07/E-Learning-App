const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');

//create Rating 
exports.createRating = async (req,res)=>{
    try{
        //get user id
        const userId = req.user.id;

        //fetch data from req body
        const {rating, review, courseId} = req.body;

        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                                   {_id: courseId},
                                                   {studentsEnrolled: {$elemMatch: {$eq: userId}}}        
                                                );

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course'
            });
        }

        //check if user has already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                        user:userId,
                                                        course: courseId
                                                    });

        if(alreadyReviewed){
            return res.json({
                success:false,
                message:'Course is already reviewed by the user'
            });
        }

        console.log(courseId);
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                                rating, review,
                                                course: courseId,
                                                user: userId
                                            });

        //update course with thos rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
                                        {
                                            $push: {
                                                ratingAndReviews: ratingReview,
                                            }
                                        },
                                        {new: true}
                                    );
        console.log(updatedCourseDetails);
                            
        //return response
        return res.status(200).json({
            success:true,
            message: 'Raing and Review created Successfully',
            ratingReview
        });
    }
    catch(error){
        console.error('Error in creating Rating and review ', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

//get Average Rating
exports.getAverageRating = async (req,res)=>{
    try{
        //get courseId
        const courseId = req.body.courseId;

        //calculate avg rating
        const result = await RatingAndReview.aggregate([ //aggregate will return all those entities with the properties mentioned in $match in an array
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId)// to convert courseId from string to an Id
                }
            },
            {
                $group:{
                    _id:null, //_id = null means not crieteria for creating any group thus creating only a single group & not multiple groups
                    averageRating:{
                        $avg:'$rating' //calculating average of rating
                    }
                }
            }
        ]);

        //return rating
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            });
        }

        //if no rating/review exist
        return res.status(200).json({
            success:true,
            message:'Average rating is 0, no rating given till now',
            averageRating:0
        });
    }
    catch(error){
        console.error('Error in getting average Rating ', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

//get All rating and reviews

exports.getAllRating = async(req,res)=>{
    try{
        const allReviews = await RatingAndReview.find({})
                                    .sort({rating:'desc'})
                                    .populate({ 
                                        path: "user",
                                        select: "firstName lastName email image"
                                    })
                                    .populate({
                                        path: "course",
                                        select: 'courseName',
                                    })
                                    .exec();
        return res.status(200).json({
            success: true,
            message: 'All reviews fetched successfully',
            data: allReviews,
        });
    }
    catch(error){
        console.error('Error in getting all Rating ', error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};