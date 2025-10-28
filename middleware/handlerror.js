const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: isProduction ? 'An unexpected error occurred.' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

export { errorHandler };