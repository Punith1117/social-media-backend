const { getUserDetails, getUserDetailsById, updateUserDetails } = require('../databaseQueries');
const { formatErrorResponse, validateUserDetailsUpdate, sanitizeInput, validateInputType } = require('../utils');

const getUserDetailsByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json(formatErrorResponse('Username is required', 'username'));
        }

        const user = await getUserDetails(username);
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

module.exports = {
    getUserDetails: getUserDetailsByUsername,
    getOwnUserDetails,
    updateUserDetails: updateUserDetailsController
};
