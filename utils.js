const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '10m';

const generateToken = (userId, username) => {
    return jwt.sign(
        { userId },
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

const normalizeUsername = (username) => username.toLowerCase();

const validateUsername = (username) => {
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!username) {
        return { valid: false, message: 'Username is required' };
    }
    if (!usernameRegex.test(username)) {
        return { 
            valid: false, 
            message: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores' 
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

const validator = require('validator');

const containsXSSPatterns = (input) => {
    // Use validator for common XSS patterns
    const dangerousPatterns = [
        'javascript:',
        'vbscript:',
        'data:',
        'onload=',
        'onerror=',
        'onclick=',
        'onmouseover=',
        '@import',
        'expression('
    ];
    
    const lowerInput = input.toLowerCase();
    return dangerousPatterns.some(pattern => lowerInput.includes(pattern));
};

const validateDisplayName = (displayName) => {
    if (displayName !== undefined && displayName !== null && displayName.length > 0) {
        // Use validator for length check
        if (!validator.isLength(displayName, { min: 1, max: 50 })) {
            return { valid: false, message: 'Display name must be at most 50 characters long', field: 'displayName' };
        }
        
        // Use validator for character validation with Unicode support
        if (!validator.matches(displayName, /^[\p{L}\p{N}\s.,!?':\-]+$/u)) {
            return { 
                valid: false, 
                message: 'Display name contains invalid characters',
                field: 'displayName'
            };
        }
        
        // Use validator for XSS detection
        if (containsXSSPatterns(displayName)) {
            return { 
                valid: false, 
                message: 'Display name contains potentially unsafe content',
                field: 'displayName'
            };
        }
    }
    return { valid: true };
};

const validateBio = (bio) => {
    if (bio !== undefined && bio !== null && bio.length > 0) {
        // Use validator for length check
        if (!validator.isLength(bio, { min: 1, max: 500 })) {
            return { valid: false, message: 'Bio must be at most 500 characters long', field: 'bio' };
        }
        
        // Use validator for XSS detection
        if (containsXSSPatterns(bio)) {
            return { 
                valid: false, 
                message: 'Bio contains potentially unsafe content',
                field: 'bio'
            };
        }
    }
    return { valid: true };
};

const validateUserDetailsUpdate = (displayName, bio) => {
    if (!displayName && !bio) {
        return { valid: false, message: 'At least one of displayName or bio must be provided', field: 'userDetails' };
    }
    
    const displayNameValidation = validateDisplayName(displayName);
    if (!displayNameValidation.valid) {
        return displayNameValidation;
    }
    
    const bioValidation = validateBio(bio);
    if (!bioValidation.valid) {
        return bioValidation;
    }
    
    return { valid: true };
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    // Use validator for comprehensive sanitization
    return validator.escape(validator.trim(input));
};

const validateInputType = (value, fieldName) => {
    if (value !== undefined && value !== null && typeof value !== 'string') {
        return { 
            valid: false, 
            message: `${fieldName} must be a string`,
            field: fieldName
        };
    }
    return { valid: true };
};

// Constants for validation
const MAX_POST_LENGTH = 300;
const MAX_PAGINATION_LIMIT = 50;

// Shared pagination validation function
const validatePagination = (page, limit) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
        return { valid: false, error: formatErrorResponse('Invalid page number', 'page') };
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > MAX_PAGINATION_LIMIT) {
        return { valid: false, error: formatErrorResponse(`Invalid limit (must be between 1 and ${MAX_PAGINATION_LIMIT})`, 'limit') };
    }

    return { valid: true, pageNum, limitNum };
};

// Shared post content validation function
const validatePostContent = (content) => {
    if (!content || content.trim().length === 0) {
        return { valid: false, error: 'Content is required' };
    }
    if (content.length > MAX_POST_LENGTH) {
        return { valid: false, error: `Content must be ${MAX_POST_LENGTH} characters or less` };
    }
    return { valid: true };
};

const validateSearchQuery = (query) => {
    if (!query) {
        return { valid: false, message: 'Search query is required', field: 'q' };
    }
    
    // Trim whitespace
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
        return { valid: false, message: 'Search query cannot be empty', field: 'q' };
    }
    
    // Use existing validateUsername method for core validation
    // This ensures search queries match username format constraints (3-20 chars, a-z0-9_)
    const usernameValidation = validateUsername(trimmedQuery);
    if (!usernameValidation.valid) {
        return { 
            valid: false, 
            message: usernameValidation.message, 
            field: 'q' 
        };
    }
    
    // XSS detection (reuse existing security pattern)
    if (containsXSSPatterns(trimmedQuery)) {
        return { 
            valid: false, 
            message: 'Search query contains potentially unsafe content', 
            field: 'q' 
        };
    }
    
    return { valid: true, sanitizedQuery: trimmedQuery.toLowerCase() };
};

// Cursor utilities for pagination
const encodeCursor = (cursorObj) => {
    return Buffer.from(JSON.stringify(cursorObj)).toString("base64");
};

const decodeCursor = (cursor) => {
    try {
        const parsed = JSON.parse(Buffer.from(cursor, "base64").toString());
        return {
            id: parsed.id,
            createdAt: new Date(parsed.createdAt)
        };
    } catch (error) {
        throw new Error('Invalid cursor format');
    }
};

const validateCursor = (cursor) => {
    if (!cursor) {
        return { valid: true }; // No cursor is valid for first page
    }
    
    if (typeof cursor !== 'string') {
        return { valid: false, error: formatErrorResponse('Cursor must be a string', 'cursor') };
    }
    
    try {
        const decoded = decodeCursor(cursor);
        
        // Validate cursor structure
        if (!decoded.id || !decoded.createdAt) {
            return { valid: false, error: formatErrorResponse('Invalid cursor structure', 'cursor') };
        }
        
        // Validate id is a number
        if (typeof decoded.id !== 'number' || decoded.id <= 0) {
            return { valid: false, error: formatErrorResponse('Invalid cursor id', 'cursor') };
        }
        
        // Validate createdAt is a valid Date
        if (!(decoded.createdAt instanceof Date) || isNaN(decoded.createdAt.getTime())) {
            return { valid: false, error: formatErrorResponse('Invalid cursor date', 'cursor') };
        }
        
        return { valid: true, decodedCursor: decoded };
    } catch (error) {
        return { valid: false, error: formatErrorResponse('Invalid or malformed cursor', 'cursor') };
    }
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    normalizeUsername,
    validateUsername,
    validatePassword,
    formatErrorResponse,
    validateDisplayName,
    validateBio,
    validateUserDetailsUpdate,
    sanitizeInput,
    validateInputType,
    MAX_POST_LENGTH,
    MAX_PAGINATION_LIMIT,
    validatePagination,
    validatePostContent,
    validateSearchQuery,
    encodeCursor,
    decodeCursor,
    validateCursor
};
