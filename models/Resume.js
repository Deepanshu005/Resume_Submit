const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    resume: {
        type: String, // or Buffer, depending on how you store the resume
        required: true,
    },
});

// Export the Resume model
module.exports = mongoose.model('Resume', ResumeSchema);
