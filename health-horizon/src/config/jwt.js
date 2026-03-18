const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
const EXPIRY = parseInt(process.env.JWT_EXPIRY) || 86400000;

const generateToken = (user) => {
    return jwt.sign(
        { sub: user.email, id: user.id, role: user.role, verificationStatus: user.verificationStatus },
        SECRET,
        { expiresIn: Math.floor(EXPIRY / 1000) }
    );
};

const verifyToken = (token) => jwt.verify(token, SECRET);

module.exports = { generateToken, verifyToken };
