const prisma = require('./prisma/prismaClient');

const getUserForAuth = async (username) => {
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

const validateUserCredentials = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        return user;
    } catch (error) {
        console.error('Error validating user credentials by id:', error);
        throw new Error('Database error while validating credentials');
    }
};

const getUserDetailsById = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                profilePhotoUrl: true,
                createdAt: true
            }
        });
        return user;
    } catch (error) {
        console.error('Error finding user by id:', error);
        throw new Error('Database error while finding user');
    }
};

const createFollow = async (followerId, followingId) => {
    try {
        const follow = await prisma.follow.create({
            data: {
                followerId,
                followingId
            }
        });
        return follow;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Already following this user');
        }
        console.error('Error creating follow:', error);
        throw new Error('Database error while creating follow');
    }
};

const deleteFollow = async (followerId, followingId) => {
    try {
        const follow = await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });
        return follow;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Not following this user');
        }
        console.error('Error deleting follow:', error);
        throw new Error('Database error while deleting follow');
    }
};

const getFollowers = async (userId) => {
    try {
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        createdAt: true
                    }
                }
            }
        });
        return followers.map(f => f.follower);
    } catch (error) {
        console.error('Error getting followers:', error);
        throw new Error('Database error while getting followers');
    }
};

const getFollowing = async (userId) => {
    try {
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        createdAt: true
                    }
                }
            }
        });
        return following.map(f => f.following);
    } catch (error) {
        console.error('Error getting following:', error);
        throw new Error('Database error while getting following');
    }
};

const getFollowStats = async (userId, currentUserId = null) => {
    try {
        const [followersCount, followingCount] = await Promise.all([
            prisma.follow.count({
                where: { followingId: userId }
            }),
            prisma.follow.count({
                where: { followerId: userId }
            })
        ]);

        let isFollowing = false;
        if (currentUserId) {
            const followRelation = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: userId
                    }
                }
            });
            isFollowing = !!followRelation;
        }

        return {
            followersCount,
            followingCount,
            isFollowing
        };
    } catch (error) {
        console.error('Error getting follow stats:', error);
        throw new Error('Database error while getting follow stats');
    }
};

const updateUserDetails = async (userId, displayName, bio, profilePhotoUrl) => {
    try {
        const updateData = {};
        
        // Handle displayName - convert empty string to null
        if (displayName !== undefined && displayName !== null) {
            updateData.displayName = displayName.length > 0 ? displayName : null;
        }
        
        // Handle bio - convert empty string to null
        if (bio !== undefined && bio !== null) {
            updateData.bio = bio.length > 0 ? bio : null;
        }

        // Handle profilePhotoUrl
        if (profilePhotoUrl !== undefined) {
            updateData.profilePhotoUrl = profilePhotoUrl;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                profilePhotoUrl: true,
                createdAt: true
            }
        });
        return user;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('User not found');
        }
        console.error('Error updating user details:', error);
        throw new Error('Database error while updating user details');
    }
};

const getUserDetails = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                profilePhotoUrl: true,
                createdAt: true
            }
        });
        return user;
    } catch (error) {
        console.error('Error getting user details by username:', error);
        throw new Error('Database error while getting user details');
    }
};

const updateUserProfilePhoto = async (userId, profilePhotoUrl) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { profilePhotoUrl },
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                profilePhotoUrl: true,
                createdAt: true
            }
        });
        return user;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('User not found');
        }
        console.error('Error updating user profile photo:', error);
        throw new Error('Database error while updating profile photo');
    }
};

const deleteUserProfilePhoto = async (userId) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { profilePhotoUrl: null },
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                profilePhotoUrl: true,
                createdAt: true
            }
        });
        return user;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('User not found');
        }
        console.error('Error deleting user profile photo:', error);
        throw new Error('Database error while deleting profile photo');
    }
};


module.exports = {
    getUserForAuth,
    getUserDetailsById,
    createUser,
    validateUserCredentials,
    createFollow,
    deleteFollow,
    getFollowers,
    getFollowing,
    getFollowStats,
    updateUserDetails,
    getUserDetails,
    updateUserProfilePhoto,
    deleteUserProfilePhoto
};
