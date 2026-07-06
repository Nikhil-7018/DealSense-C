export function errorHandler(err, req, res, _next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error(err);

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