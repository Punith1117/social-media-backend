const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { validateUserCredentials } = require('../databaseQueries');

const JWT_SECRET = process.env.JWT_SECRET;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await validateUserCredentials(jwt_payload.userId);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        console.error('JWT Strategy error:', error);
        return done(error, false);
    }
}));

const authenticate = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

const optionalAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(); // Continue without user on error
        }
        req.user = user || null; // Set user or null
        next();
    })(req, res, next);
};

module.exports = {
    authenticate,
    optionalAuth,
    passport
};
