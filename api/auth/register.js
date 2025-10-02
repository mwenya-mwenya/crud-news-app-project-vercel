import bcrypt from 'bcrypt'; // For securely hashing passwords
import jwt from 'jsonwebtoken'; // For generating access and refresh tokens
import { User } from '../../lib/models/User.js'; // Mongoose User model
import { config } from '../../lib/config/env.js'; // Environment config (e.g. secrets, expiration)
import { validate, registerSchema } from '../../lib/validators/auth.js'; // Zod schema for registration
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

  // Reject any non-POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure request body exists and is an object
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid request body' });
  }

  // Validate request body against registerSchema using Zod
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten(), // Structured error output for client-side display
    });
  }

  // Destructure validated and sanitized data
  const { email, password, username } = result.data;

  try {
    // Connect to MongoDB
    await connectDB();

    // Hash the user's password with 12 salt rounds
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    // Create and store the new user in the database
    const user = await User.create({ email, passwordHash, username });

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { email }, // Payload
      config.jwtSecret, // Secret key
      {
        subject: String(user._id), // User ID as subject
        expiresIn: config.jwtExpiresIn, // e.g. '15m'
      }
    );

    // Generate refresh token (longer-lived)
    const refreshToken = jwt.sign(
      { email },
      config.refreshSecret,
      {
        subject: String(user._id),
        expiresIn: config.refreshExpiresIn, // e.g. '7d'
      }
    );

    // Respond with user info and tokens
    return res.status(201).json({
      id: user._id,
      email: user.email,
      username: user.username,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    // Log request body for debugging (optional)
    console.log('REQ BODY =>', req.body);

    // Log error details to server console
    console.error('Registration error:', err);

    // Gracefully respond with error status and message
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
}