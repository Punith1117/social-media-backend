const prisma = require('./prisma/prismaClient');

const findUserByUsername = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });
        return user;
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw new Error('Database error while finding user');
    }
};

const createUser = async (username, hashedPassword) => {
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });
        return user;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Username already exists');
        }
        console.error('Error creating user:', error);
        throw new Error('Database error while creating user');
    }
};

const validateUserCredentials = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });
        return user;
    } catch (error) {
        console.error('Error validating user credentials:', error);
        throw new Error('Database error while validating credentials');
    }
};

module.exports = {
    findUserByUsername,
    createUser,
    validateUserCredentials
};
