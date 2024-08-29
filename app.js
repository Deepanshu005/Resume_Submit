const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
dotenv.config();
const mongoose = require('mongoose');

// Load User , Contact  and Resume models
const User = require('./models/User');
const Resume = require('./models/Resume');
const Contact = require("./models/Contact");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up multer for file uploads
const upload = multer({ dest: 'public/uploads/' });

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODBURL }),
}));

// Serve the signup page and index page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/signup.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

// Serve the resume submission form
app.get('/submit-resume', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'views/resume.html'));
});

// Serve About Us page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
});

// Serve Contact Us page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/contact.html'));
});

// Serve Privacy Policy page
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/privacy.html'));
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    newUser.save()
        .then(() => res.redirect('/login'))
        .catch(err => res.status(500).send('You have already registered with this email id'));
});

// Handle contact form 
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    const newContact = new Contact({
        name: name,
        email: email,
        message: message
    });

    newContact.save()
        .then(() => {
            res.send('Thank you for contacting us! We will get back to you soon.');
        })
        .catch((err) => {
            res.status(500).send('Sorry, there was an error saving your message.');
            console.error(err);
        });
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.redirect('/submit-resume');
    } else {
        res.send('Invalid email or password.');
    }
});

// Handle resume submission
app.post('/submit-resume', upload.single('resume'), (req, res) => {
    const { name, email } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
        return res.status(400).send('Please upload a resume.');
    }

    cloudinary.uploader.upload(resumeFile.path, { resource_type: 'raw' }, function (error, result) {
        if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return res.status(500).send('Error uploading resume.');
        }

        const newResume = new Resume({
            name,
            email,
            resume: result.secure_url,
        });

        newResume.save()
            .then(() => res.send('Resume submitted successfully.'))
            .catch(err => res.status(500).send('Error submitting resume.'));
    });
});

// Start the server
const database = process.env.MONGODBURL;

const start = async () => {
    try {
        await mongoose.connect(database);
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log("Server is connected to MongoDB Atlas");
        });
    } catch (err) {
        console.log("Error found", err);
    }
};

start();
