const { verifyToken } = require('../config/jwt');
const { User } = require('../models/index');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        const user = await User.findOne({ where: { email: decoded.sub } });
        if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    next();
};

module.exports = { authenticate, authorize };
