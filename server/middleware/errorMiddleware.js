// 404 not found handler
const notFound = (req, res, next) => {
  console.error(`Route not found: ${req.method} ${req.originalUrl}`);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  console.error(`Error handling request: ${req.method} ${req.originalUrl}`);
  console.error(`Error details: ${err.message}`);
  console.error(err.stack);

  // Handle missing route errors more gracefully
  if (err.message.includes('Not Found')) {
    statusCode = 404;
    message = `The requested endpoint '${req.originalUrl}' does not exist on this server.`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export { notFound, errorHandler };