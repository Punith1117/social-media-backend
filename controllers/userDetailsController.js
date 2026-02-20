const { getUserDetails, getUserDetailsById, updateUserDetails, updateUserProfilePhoto, deleteUserProfilePhoto } = require('../databaseQueries');
const { formatErrorResponse, normalizeUsername, validateUserDetailsUpdate, sanitizeInput, validateInputType } = require('../utils');
const cloudinary = require('../config/cloudinary');

const getUserDetailsByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Normalize username at API boundary
        const normalizedUsername = normalizeUsername(username);

        if (!username) {
            return res.status(400).json(formatErrorResponse('Username is required', 'username'));
        }

        const user = await getUserDetails(normalizedUsername);
        if (!user) {
            return res.status(404).json(formatErrorResponse('User not found', 'username'));
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get user details error:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getOwnUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await getUserDetailsById(userId);
        if (!user) {
            return res.status(404).json(formatErrorResponse('User not found'));
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get own user details error:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const updateUserDetailsController = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Extract only allowed fields
        const { displayName, bio } = req.body;
        
        // Sanitize inputs first
        const sanitizedDisplayName = displayName !== undefined ? sanitizeInput(displayName) : undefined;
        const sanitizedBio = bio !== undefined ? sanitizeInput(bio) : undefined;
        
        // Validate input types (on sanitized data)
        const displayNameTypeValidation = validateInputType(sanitizedDisplayName, 'displayName');
        if (!displayNameTypeValidation.valid) {
            return res.status(400).json(formatErrorResponse(displayNameTypeValidation.message, displayNameTypeValidation.field));
        }
        
        const bioTypeValidation = validateInputType(sanitizedBio, 'bio');
        if (!bioTypeValidation.valid) {
            return res.status(400).json(formatErrorResponse(bioTypeValidation.message, bioTypeValidation.field));
        }

        // Validate that at least one field is provided and content is valid
        const validation = validateUserDetailsUpdate(sanitizedDisplayName, sanitizedBio);
        if (!validation.valid) {
            return res.status(400).json(formatErrorResponse(validation.message, validation.field));
        }

        const updatedUser = await updateUserDetails(userId, sanitizedDisplayName, sanitizedBio);

        res.status(200).json({
            message: 'User details updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update user details error:', error);
        if (error.message === 'User not found') {
            return res.status(404).json(formatErrorResponse('User not found'));
        }
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json(formatErrorResponse('No file uploaded', 'file'));
        }

        // Get URL from uploaded file - Cloudinary stores it in 'path' property
        const profilePhotoUrl = req.file.path;
        
        if (!profilePhotoUrl) {
            return res.status(500).json(formatErrorResponse('Failed to get uploaded file URL', 'file'));
        }

        // Update user's profile photo URL in database
        const updatedUser = await updateUserProfilePhoto(userId, profilePhotoUrl);

        res.status(200).json({
            message: 'Profile photo uploaded successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Upload profile photo error:', error);
        if (error.message === 'User not found') {
            return res.status(404).json(formatErrorResponse('User not found'));
        }
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const deleteProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current user to check if they have a profile photo
        const currentUser = await getUserDetailsById(userId);
        if (!currentUser) {
            return res.status(404).json(formatErrorResponse('User not found'));
        }

        // If user has a profile photo, delete it from Cloudinary
        if (currentUser.profilePhotoUrl) {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = currentUser.profilePhotoUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = filename.split('.')[0];
                
                // Delete image from Cloudinary
                await cloudinary.uploader.destroy(`profile-photos/${publicId}`);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
                // Continue with database update even if Cloudinary deletion fails
            }
        }

        // Remove profile photo URL from database
        const updatedUser = await deleteUserProfilePhoto(userId);

        res.status(200).json({
            message: 'Profile photo deleted successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Delete profile photo error:', error);
        if (error.message === 'User not found') {
            return res.status(404).json(formatErrorResponse('User not found'));
        }
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

module.exports = {
    getUserDetails: getUserDetailsByUsername,
    getOwnUserDetails,
    updateUserDetails: updateUserDetailsController,
    uploadProfilePhoto,
    deleteProfilePhoto
};
