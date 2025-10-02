import bcrypt from 'bcrypt'; // For securely hashing passwords
import jwt from 'jsonwebtoken'; // For generating access and refresh tokens
import { User } from '../../lib/models/User.js'; // Mongoose User model
import { config } from '../../lib/config/env.js'; // Environment config (e.g. secrets, expiration)
import { validate, loginSchema } from '../../lib/validators/auth.js'; // Zod schema for registration
import { connectDB } from '../../lib/db/connect.js'; // MongoDB connection helper

// API route handler for user registration
export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  function signAccessToken(user) {
    return jwt.sign(
      { email: user.email },
      config.jwtSecret,
      { subject: String(user._id), expiresIn: config.jwtExpiresIn }
    );
  }

  function signRefreshToken(user) {
    return jwt.sign(
      { email: user.email },
      config.refreshSecret,
      { subject: String(user._id), expiresIn: config.refreshExpiresIn }
    );
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    //  Validate request body
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(), // Structured error output for client-side display
      });
    }
    const { email, password } = result.data;

    // Find user by email

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User email not found please register' });
    }

    // Compare password hash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Respond with tokens and username
    res.status(200).json({
      accessToken,
      refreshToken,
      username: user.username
    });
  } catch (err) {


    // Log error details to server console
    console.error('Registration error:', err);

    // Gracefully respond with error status and message
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
}

