const errorFormatter = (e) => {
    let errors = {};
    const allErrors = e.substring(e.indexOf(':') + 1).split(',');
    const errorsInArray = allErrors.map(err => err.trim());
    errorsInArray.forEach(error => {
        const [key, value] = error.split(':').map(err => err.trim());
        errors[key.trim()] = value.trim();
    });

    return errors;
}

const errorHandler = (e, req, res, next) => {
    if (e.name === 'ValidationError') {
        const errors = errorFormatter(e.message);
        res.status(400).json({errors, case: 'VALIDATION_ERROR'});
    } else if (e.name === 'CastError') {
        res.status(400).json({message: 'Invalid id.', case: 'CAST_ERROR'});
    } else if (e.name === 'MongoError') {
        res.status(400).json({message: 'Invalid data.', case: 'MONGO_ERROR'});
    } else if (e.name === 'JsonWebTokenError') {
        res.status(401).json({message: 'User is not authorized.', case: 'JWT_ERROR'});
    } else if (e.name === 'MongoServerError') {
        if (e.code === 11000) {
            const keyName = Object.entries(e.keyValue)[0].join(': ');
            res.status(400).json({message: `Duplicate key error on ${keyName}`, case: 'MONGO_SERVER_ERROR'});
        }
    } else {
        res.status(500).json({message: 'Internal server error.', case: 'INTERNAL_SERVER_ERROR'});
    }
}

module.exports = errorHandler;