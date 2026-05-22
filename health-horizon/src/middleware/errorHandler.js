const errorHandler = (err, req, res, next) => {
    console.error('--- ERROR HANDLER TRIGGERED ---');
    console.error(err.stack || err);
    if (err.parent || err.original) {
        console.error('SQL Error Details:', err.parent || err.original);
    }
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
};
module.exports = errorHandler;
