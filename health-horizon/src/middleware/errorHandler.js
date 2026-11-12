
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = Number(err.status || err.statusCode);

    console.error('[API Error]', {
        method: req.method,
        path: req.path,
        status: Number.isInteger(status) ? status : 500,
        message: err.message
    });

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            message: 'File exceeds the maximum allowed size.'
        });
    }

    if (
        err.code === 'LIMIT_FILE_COUNT' ||
        err.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
        return res.status(400).json({
            message: 'Invalid file upload request.'
        });
    }

    const safeStatus =
        Number.isInteger(status) && status >= 400 && status <= 599
            ? status
            : 500;

    return res.status(safeStatus).json({
        message: safeStatus >= 500
            ? 'Internal server error.'
            : err.message || 'Request failed.'
    });
};

module.exports = errorHandler;
