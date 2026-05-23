export function notFoundHandler(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  if (!res.headersSent) {
    res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  } else {
    console.error(err);
  }
}
