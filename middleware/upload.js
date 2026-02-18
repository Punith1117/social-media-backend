const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { formatErrorResponse } = require('../utils');

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-photos', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    public_id: (req, file) => `user_${req.user.id}_${Date.now()}`, // Unique filename
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Resize to max 800x800
      { quality: 'auto:good' } // Optimize quality
    ],
    resource_type: 'image' // Ensure we're handling images
  }
});

// Configure Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
    }
    cb(null, true);
  }
});

// Error handling middleware for Multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(formatErrorResponse('File too large. Maximum size is 5MB.', 'file'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(formatErrorResponse('Too many files. Only one file is allowed.', 'file'));
    }
    return res.status(400).json(formatErrorResponse(`Upload error: ${error.message || 'Unknown upload error'}`, 'file'));
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json(formatErrorResponse(error.message, 'file'));
  }
  
  // Handle Cloudinary errors
  if (error.message && error.message.includes('Cloudinary')) {
    return res.status(500).json(formatErrorResponse('Image upload service error. Please try again.', 'file'));
  }
  
  // Handle other errors
  if (error.message) {
    return res.status(500).json(formatErrorResponse(error.message, 'file'));
  }
  
  next(error);
};

module.exports = {
  upload,
  handleUploadError
};
