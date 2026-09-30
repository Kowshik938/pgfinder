import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'pgfinder_super_secure_jwt_secret_phase2_2026';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    role?: string;
  };
  dbUser?: typeof users.$inferSelect;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Try 1: Verify as Custom JWT Token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.userId) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (existingUser) {
        req.dbUser = existingUser;
        req.user = {
          uid: existingUser.uid,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        };
        return next();
      }
    }
  } catch (jwtErr) {
    // If not a custom JWT, try Firebase Auth token
  }

  // Try 2: Verify as Firebase ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    // Synchronize or load PostgreSQL user record
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, decodedToken.uid))
      .limit(1);

    if (existing.length > 0) {
      req.dbUser = existing[0];
    } else {
      // Auto-provision user record in PostgreSQL
      const [newUser] = await db
        .insert(users)
        .values({
          uid: decodedToken.uid,
          email: decodedToken.email || 'user@example.com',
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
          avatar: decodedToken.picture || null,
          role: 'USER',
        })
        .returning();
      req.dbUser = newUser;
    }

    return next();
  } catch (firebaseErr) {
    console.error('Failed to verify token via JWT and Firebase:', firebaseErr);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!allowedRoles.includes(req.dbUser.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your active role is '${req.dbUser.role}'.`,
      });
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.userId) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (existingUser) {
        req.dbUser = existingUser;
        req.user = {
          uid: existingUser.uid,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        };
        return next();
      }
    }
  } catch {
    // Try Firebase
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, decodedToken.uid))
      .limit(1);
    if (existing.length > 0) {
      req.dbUser = existing[0];
    }
  } catch {
    // Soft ignore for optional auth
  }

  next();
};
