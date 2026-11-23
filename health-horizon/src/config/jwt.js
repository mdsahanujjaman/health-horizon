const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Production must supply a stable, high-entropy secret. Development may use
// an ephemeral secret so local setup works without committing credentials.
const SECRET = process.env.JWT_SECRET || (
    process.env.NODE_ENV === 'production'
        ? (() => { throw new Error('JWT_SECRET is required in production.'); })()
        : crypto.randomBytes(32).toString('hex')
);

if (process.env.JWT_SECRET && Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes.');
}

const EXPIRY = parseInt(process.env.JWT_EXPIRY, 10) || 86400000;

const generateToken = (user) => {
    return jwt.sign(
        { sub: user.email, id: user.id, role: user.role, verificationStatus: user.verificationStatus },
        SECRET,
        { expiresIn: Math.floor(EXPIRY / 1000) }
    );
};

const verifyToken = (token) => jwt.verify(token, SECRET);

module.exports = { generateToken, verifyToken };
