const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');

const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const { passwordUpdated } = require("../mailTemplates/passwordUpdated");
const mailSender = require('../utils/mailSender');

require('dotenv').config();

//send otp
exports.sendOTP = async(req, res) =>{
    try{
        //fetch email from req body
        const {email} = req.body;

        //check if user already exists
        const checkUserPresent = await User.findOne({email:email});
        //if user already exists then return 
        
        if(checkUserPresent){
            return res.json({
                success:false,
                message:"User already exists"
            });
        }

        //generate otp
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        let result = await OTP.findOne({otp: otp});

        while(result){ //this brute force approach of checking again and again that wether this otp exists in DB or not is not good. Must use something else 
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({otp: otp});

        }
        console.log('OTP generated : ',otp);
        
        const otpPayload = {email, otp};

        // create an entry for otp in DB
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfull
        return res.status(200).json({
            success: true,
            message: "OTP generated successfully",
            otp
        });
    }
    catch(error){
        console.log("Error in otp generation", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


//SignUp controller for registering users
exports.signUp = async (req, res)=>{
    try{
        //data fetch from request's body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;

        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are not present"
            });
        }

        //match password and confirm password
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password and ConfirmedPassword does not match, please try again'
            });
        }

        //check user already exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User is already registered'
            });
        }

        //find most recent otp for the user
        const response = await OTP.find({email:email}).sort({createdAt:-1}).limit(1);
        console.log('this is response', response);

        //validate OTP
        if(response.length === 0){
            //OTP not found
            return res.json({
                success:false,
                message:"OTP not valid",
            });
        }
        else if(otp !== response[0].otp){
            //Invalid OTP
            return res.json({
                success:false,
                message:"Invalid OTP"
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create entry in DB

        const profileDetails  = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });

        let user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}+${lastName}` //This api from dicebeer will generate default image for every account
        });

        user = await User.findById(user._id).populate('additionalDetails');
        
        ///------From here -------///
        const payload = {
            email: user.email,
            id: user._id,
            accountType:user.accountType,
        }
        const token = JWT.sign(payload, process.env.JWT_SECRET, {
            // expiresIn: "3h",            
        })

        user.token = token;
        user.password = undefined
        
        //create cookie
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true,
        }
        
        res.cookie('token', token, options).status(200).json({
            success:true,
            token,
            user,
            message:'Logged in successfully'
        });
        /////----- Upto here ----/// This code is written so that the user automatically get's logged in into the system after signup

        //return res
        // return res.status(200).json({
        //     success:true,
        //     message:'User is registered successfully',
        //     user,
        // });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: true,
            message: "User cannot be registered please try again",
        });
    }
};

//log in
exports.logIn = async (req, res)=>{
    try{
        //get data from user 
        const {email, password} = req.body;

        //validate data
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: 'All fields are required, please try again'
            });
        }

        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.json({
                success:false,
                message:"User is not registered, please try again"
            });
        }

        // console.log(password, user.password);
        
        //Match password and generate JWT 
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = JWT.sign(payload, process.env.JWT_SECRET, {
                // expiresIn: "3h",            
            })

            user.token = token;
            user.password = undefined
            
            //create cookie
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
            
            res.cookie('token', token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully'
            });
        }
        else{ //password not matched
            return res.json({
                success: false,
                message: 'Password is incorrect'
            });
        }

    }
    catch(error){
        console.log('Error in Log in ',error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again'
        });
    }
};


//change password
exports.changePassword = async(req,res)=>{

    try{
        //fetch data
        const {oldPassword, newPassword, email} = req.body;

        //validate data
        if(!oldPassword || !newPassword){
            return res.status(403).json({
                success:false,
                message:'All fields are required, Please try again'
            });
        }

        const user = await User.findOne({email});

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if(!isPasswordMatch){
            return res.json({
                success:false,
                message:'Current Password is Wrong, Try again'
            });
        }
    
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // create entry in DB
        const updatedUserDetails = await User.findOneAndUpdate(
                                    {email: user.email},
                                    {
                                        password: newHashedPassword
                                    },
                                    {new:true}      
                                );

        //send mail
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
                )
                console.log("Email sent successfully:", emailResponse.response)

        }
        catch(error){
            console.log("error occured while sending mails", error);
            throw error;
        }
        //return response
        return res.json({
            success: true,
            message: 'Your password is updated successfully'
        });

    }
    catch(error){
        console.log('Error in Changing password ', error);
        return res.status(400).json({
            success:true,
            message: error.message
        });
    }   
};
