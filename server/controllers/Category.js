const Category = require('../models/Category');

//create Category handler function 

exports.createCategory = async(req, res)=>{
    try{
        //fetch data
        const {name, description} = req.body;

        //validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        //create entry in DB
        const categoryDetails = await Category.create({
            name:name,
            description: description,
        });
        console.log(categoryDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:"Category created successfully"
        })
    }
    catch(error){
        console.log('Error in creating Category ', error);
        return res.status(500).json({
            success: 'false',
            message: error.message
        });
    }
}

//getAllCategorys handler function

exports.showAllCategory = async(req,res)=>{
    try {
        const allCategory = await Category.find({}, {name:true, description:true, courses:true}); //This line means that we don't want to find any Category on basis of any particular
                                                                //attruibute (i.e get all the Categories, just make sure that the name and description is present in it)
        res.status(200).json({
            success:true,
            message: 'All Categorys fetched successfully',
            allCategory
        });

    } 
    catch (error) {
        console.log('Error in getting all Categorys ', error);
        return res.stautus(500).json({
            success:false,
            message: error.message
        });
    }
};

exports.categoryPageDetails = async(req,res)=>{
    try{
        //get category Id
        const {categoryId} = req.body;

        //get courses for specified category
        let selectedCategory = await Category.findById(categoryId)
                                        .populate({
                                            path: "courses",
                                            match: {status: "Published"},
                                            populate: [
                                                { path: "instructor" },
                                                { path: "ratingAndReviews" }
                                            ]
                                        })
                                        .exec();

        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data not found"
            });
        }

        let mostPopularCoursesInCurrentCategory = [...selectedCategory.courses]?.sort((a, b) => b?.sold - a?.sold);  //sort the array for most selling courses

        if (selectedCategory && selectedCategory.courses) { //sort the current category for most recent courses
            selectedCategory.courses = selectedCategory.courses.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        } else {
            console.log("Courses array is undefined or empty.");
        }

        //get courses for different categories
        let categoriesExceptSelected = await Category.find({
                                            _id: {$ne: categoryId}, //ne is not equal
                                    })
                                    .populate({
                                        path: "courses",
                                        match: {status: "Published"},
                                        populate: [
                                            { path: "instructor" },
                                            { path: "ratingAndReviews" }
                                        ]
                                    })
                                    .exec();

        categoriesExceptSelected = categoriesExceptSelected.filter(category => category?.courses?.length > 0); //only categories which has some courses

        //get any other different category
        function getRandomInt(max) {
            return Math.floor(Math.random() * max)
        }
        let anyDifferentCategory = await Category.findOne( //any other category except current category
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                ?._id
            )
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: [
                    { path: "instructor" },
                    { path: "ratingAndReviews" }
                ]
            })
            .exec()

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        anyDifferentCategory.courses = shuffleArray(anyDifferentCategory.courses); //shuffle that any other category

        // get top selling courses
        const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: [
            { path: "instructor" },
            { path: "ratingAndReviews" }
          ]
        })
        .exec()
        const allCourses = allCategories.flatMap((category) => category.courses);
        const topSellingCourses = allCourses //most popular courses out of all 
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10);

        //return response
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                mostPopularCoursesInCurrentCategory,
                anyDifferentCategory,
                topSellingCourses
            }
        })

    }
    catch(error){
        console.log('Error in category Page Details ', error);
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
};