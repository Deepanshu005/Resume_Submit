const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Define the schema for Resume with metadata
const ResumeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
});

// Model for the Resume schema
const Resume = mongoose.model('Resume', ResumeSchema);

// Function to store a file in GridFS
const saveFile = async (fileStream, filename, contentType) => {
    const bucket = new GridFSBucket(mongoose.connection.db);
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    fileStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
    });
};

// Function to retrieve a file from GridFS
const retrieveFile = async (filename, res) => {
    const bucket = new GridFSBucket(mongoose.connection.db);
    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.pipe(res);

    return new Promise((resolve, reject) => {
        downloadStream.on('end', resolve);
        downloadStream.on('error', reject);
    });
};

module.exports = { Resume, saveFile, retrieveFile };
