const { getUserForAuth, createUser } = require('../databaseQueries');
const { generateToken, hashPassword, comparePassword, normalizeUsername, validateUsername, validatePassword, formatErrorResponse } = require('../utils');

const signup = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Normalize username at API boundary
        const normalizedUsername = normalizeUsername(username);

        const usernameValidation = validateUsername(normalizedUsername);
        if (!usernameValidation.valid) {
            return res.status(400).json(formatErrorResponse(usernameValidation.message, 'username'));
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json(formatErrorResponse(passwordValidation.message, 'password'));
        }

        const existingUser = await getUserForAuth(normalizedUsername);
        if (existingUser) {
            return res.status(409).json(formatErrorResponse('Username already exists', 'username'));
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await createUser(normalizedUsername, hashedPassword);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.message === 'Username already exists') {
            return res.status(409).json(formatErrorResponse('Username already exists', 'username'));
        }
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Normalize username at API boundary
        const normalizedUsername = normalizeUsername(username);

        if (!username) {
            return res.status(400).json(formatErrorResponse('Username is required', 'username'));
        }
        if (!password) {
            return res.status(400).json(formatErrorResponse('Password is required', 'password'));
        }

        const user = await getUserForAuth(normalizedUsername);
        if (!user) {
            return res.status(401).json(formatErrorResponse('Invalid username or password', 'password'));
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(formatErrorResponse('Invalid username or password', 'password'));
        }

        const token = generateToken(user.id, user.username);

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

module.exports = {
    signup,
    login
};
