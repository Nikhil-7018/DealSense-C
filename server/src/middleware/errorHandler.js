export function notFoundHandler(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  console.error(err);

  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (!res.headersSent) {
    res.status(status).json({
      success: false,
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState,
      stack: err.stack,
    });
  }
}