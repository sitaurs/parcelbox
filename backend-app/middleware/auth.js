import jwt from 'jsonwebtoken';
import { readDB, writeDB, findInDB, deleteFromDB } from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smartparcel_secret_key_change_in_production_2025';
const DEVICE_JWT_SECRET = process.env.DEVICE_JWT_SECRET || 'device_jwt_secret_change_in_production_2025';
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT_HOURS || '24') * 60 * 60 * 1000;
const DEVICE_TOKEN_EXPIRY = '365d'; // Device tokens valid for 1 year

/**
 * Generate JWT token for user
 */
export function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Create session
 */
export function createSession(username, token) {
  const sessions = readDB('sessions');
  
  const session = {
    id: crypto.randomUUID(),
    username,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TIMEOUT).toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  sessions.push(session);
  writeDB('sessions', sessions);
  
  return session;
}

/**
 * Find session by token
 */
export function findSession(token) {
  return findInDB('sessions', s => s.token === token);
}

/**
 * Update session activity
 */
export function updateSessionActivity(token) {
  const sessions = readDB('sessions');
  const sessionIndex = sessions.findIndex(s => s.token === token);
  
  if (sessionIndex !== -1) {
    sessions[sessionIndex].lastActivity = new Date().toISOString();
    writeDB('sessions', sessions);
    return true;
  }
  
  return false;
}

/**
 * Delete session
 */
export function deleteSession(token) {
  return deleteFromDB('sessions', s => s.token === token);
}

/**
 * Clean expired sessions
 */
export function cleanExpiredSessions() {
  const sessions = readDB('sessions');
  const now = new Date();
  const validSessions = sessions.filter(s => new Date(s.expiresAt) > now);
  
  if (validSessions.length !== sessions.length) {
    writeDB('sessions', validSessions);
    console.log(`Cleaned ${sessions.length - validSessions.length} expired sessions`);
  }
}

/**
 * Auth middleware - verify JWT token
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  const session = findSession(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Session not found' });
  }
  
  // Check if session expired
  if (new Date(session.expiresAt) < new Date()) {
    deleteSession(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  // Update last activity
  updateSessionActivity(token);
  
  req.user = decoded;
  req.session = session;
  next();
}

/**
 * Generate device JWT token
 * @param {string} deviceId - Unique device identifier (e.g., 'esp32-cam', 'esp8266-lock')
 * @returns {string} JWT token valid for 1 year
 */
export function generateDeviceToken(deviceId) {
  return jwt.sign(
    { 
      deviceId, 
      type: 'device',
      iat: Math.floor(Date.now() / 1000)
    }, 
    DEVICE_JWT_SECRET, 
    { expiresIn: DEVICE_TOKEN_EXPIRY }
  );
}

/**
 * Verify device JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyDeviceToken(token) {
  try {
    const decoded = jwt.verify(token, DEVICE_JWT_SECRET);
    
    // Ensure it's a device token (not user token)
    if (decoded.type !== 'device') {
      return null;
    }
    
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Device token middleware - verify device API bearer token
 * Supports both JWT (recommended) and legacy plain token (backward compatibility)
 */
export function deviceTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No device token provided' });
  }
  
  const token = authHeader.substring(7);
  
  // Try JWT validation first (recommended method)
  const decoded = verifyDeviceToken(token);
  if (decoded) {
    req.device = decoded; // Attach device info to request
    return next();
  }
  
  // Fallback to legacy plain token for backward compatibility
  // TODO: Remove this after all devices migrated to JWT
  const legacyToken = process.env.DEVICE_TOKEN || 'device_token_change_this';
  if (token === legacyToken) {
    req.device = { deviceId: 'legacy', type: 'device' };
    return next();
  }
  
  return res.status(401).json({ error: 'Invalid device token' });
}

// Clean expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);
