import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function authRequired(req, res, next) {

  const header = req.headers.authorization || '';

  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };

    return { id: payload.sub, email: payload.email };

  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}