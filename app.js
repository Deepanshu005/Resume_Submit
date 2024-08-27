const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
// Load User , Contact  and Resume models
const User = require('./models/User');
const Resume = require('./models/Resume');
const Contact = require("./models/Contact");

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB

main().catch(err => console.log(err));

async function main() {
    console.log("Server is contected");
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/yourhr' }),
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


// Handle Contact Us form submission
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);
    res.send('Thank you for contacting us! We will get back to you soon.');
});

// Handle resume submission
app.post('/submit-resume', upload.single('resume'), (req, res) => {
    const { name, email } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
        return res.status(400).send('Please upload a resume.');
    }

    const newResume = new Resume({
        name,
        email,
        resume: resumeFile.filename,
    });

    newResume.save()
        .then(() => res.send('Resume submitted successfully.'))
        .catch(err => res.status(500).send('Error submitting resume.'));
});


// Start the server
 database=process.env.MONGODBURL;
 const start=async(req,res)=>{
    try{
        await mongoose.connect(database);
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            
            console.log("Server is contected");
            
        });
    }catch(err){
        console.log("Error found",err)

    }
 }

start();