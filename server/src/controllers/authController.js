import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    res.status(400);
    throw new Error('email, password, and name are required');
  }

  const existing = await userModel.findUserByEmail(email);
  if (existing) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = await userModel.createUser({ email, passwordHash, name });
  const user = await userModel.findUserById(id);
  const token = signToken({ id, email });

  res.status(201).json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error('email and password are required');
  }

  const user = await userModel.findUserByEmail(email);
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = signToken({ id: user.id, email: user.email });
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await userModel.findUserById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});
