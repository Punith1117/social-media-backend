const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '10m';

const generateToken = (userId, username) => {
    return jwt.sign(
        { userId, username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!username) {
        return { valid: false, message: 'Username is required' };
    }
    if (!usernameRegex.test(username)) {
        return { 
            valid: false, 
            message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' 
        };
    }
    return { valid: true };
};

const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }
    if (password.length < 5) {
        return { valid: false, message: 'Password must be at least 5 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
};

const formatErrorResponse = (message, field = null, statusCode = 400) => {
    const error = { error: message };
    if (field) {
        error.field = field;
    }
    return error;
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    validateUsername,
    validatePassword,
    formatErrorResponse
};
