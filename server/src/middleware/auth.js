import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401);
    return next(new Error('Authentication required'));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500);
      return next(new Error('JWT_SECRET is not configured'));
    }
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401);
    next(new Error('Invalid or expired token'));
  }
}
