const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = ()=>{
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log('DB connection successfull'))
    .catch((error)=>{
        console.log('Database Connection Failed');
        console.error(error);
        process.exit(1);
    })
}

module.exports = connectToDatabase;