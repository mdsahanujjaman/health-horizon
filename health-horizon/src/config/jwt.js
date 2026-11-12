
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const EXPIRY = Number(process.env.JWT_EXPIRY ?? 86400000);

// Fail securely if authentication configuration is missing or invalid.
if (!SECRET || SECRET.length < 32) {
    throw new Error(
        'JWT_SECRET must be configured with at least 32 characters.'
    );
}

if (!Number.isSafeInteger(EXPIRY) || EXPIRY <= 0) {
    throw new Error('JWT_EXPIRY must be a positive integer in milliseconds.');
}

const generateToken = (user) => {
    return jwt.sign(
        {
            sub: user.email,
            id: user.id,
            role: user.role,
            verificationStatus: user.verificationStatus
        },
        SECRET,
        { expiresIn: Math.floor(EXPIRY / 1000) }
    );
};

const verifyToken = (token) => jwt.verify(token, SECRET);

module.exports = { generateToken, verifyToken };
