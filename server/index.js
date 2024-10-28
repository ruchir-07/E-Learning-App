const express = require('express');
const app = express();

const connectToDatabase = require('./config/database');
const {cloudinaryConnect} = require('./config/cloudinary');
const dotenv = require('dotenv');

const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');

const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payment');
const courseRoutes = require('./routes/course');
const contactUsRoute = require('./routes/contact');

dotenv.config();

const PORT = process.env.PORT || 4000;

//database connect
connectToDatabase();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    })
);
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:'/tmp'
    })
);
app.use(
    express.urlencoded({
      extended: true,
    })
);

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
);

//cloudinary connect
cloudinaryConnect();

// Set Access-Control-Allow-Credentials header
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

//routes 
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

//default route
app.get('/', (req, res)=>{
    return res.json({
        success:true,
        message:'Your server is up and running...'
    });
});

app.listen(PORT, ()=>{
    console.log(`App is running at PORT:${PORT}`);
});
