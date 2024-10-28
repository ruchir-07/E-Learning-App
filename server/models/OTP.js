const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require('../mailTemplates/emailVerificationTemplate');

const OTPSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60*5
    }
});

//to send emails
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(
            email,
            "Verification Email from StudyCraze",
            otpTemplate(otp) 
            );
        console.log("Email sent successfully", mailResponse);
    }
    catch(error){
        console.log("error occured while sending mails", error);
        throw error;
    }
}

// Here We are using post middleware because we want to send the otp mail after the entry of otp is created in Database
OTPSchema.post("save", async function(next){ 
    await sendVerificationEmail(this.email, this.otp);
    // next();
})

module.exports = mongoose.model('OTP', OTPSchema);