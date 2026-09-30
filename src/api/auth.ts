import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.ts';
import { db } from '../db/index.ts';
import { users, pgs } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pgfinder_super_secure_jwt_secret_phase2_2026';

// Helper to sign JWT token
const generateToken = (user: typeof users.$inferSelect) => {
  return jwt.sign(
    {
      userId: user.id,
      uid: user.uid,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register - Real user registration with role
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role = 'USER' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }

    const assignedRole = ['USER', 'OWNER'].includes(role) ? role : 'USER';
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with salt rounds = 10
    const passwordHash = await bcrypt.hash(password, 10);
    const customUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create user in PostgreSQL
    const [newUser] = await db
      .insert(users)
      .values({
        uid: customUid,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: assignedRole,
        avatar:
          assignedRole === 'OWNER'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      })
      .returning();

    // Generate JWT token
    const token = generateToken(newUser);

    // Omit passwordHash from output
    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: `Registration successful! Welcome to PGFinder as a ${assignedRole}.`,
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login - Secure login with password comparison
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'This account was signed up via Google. Please use Google Sign-In.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/auth/me - Current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    const { passwordHash: _, ...safeUser } = req.dbUser;
    return res.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

// POST /api/auth/role - Switch active role
router.post('/role', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    if (!['USER', 'OWNER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    if (!req.dbUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, req.dbUser.id))
      .returning();

    const { passwordHash: _, ...safeUser } = updated;
    const newToken = generateToken(updated);

    return res.json({
      success: true,
      message: `Role switched to ${role}`,
      token: newToken,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return res.status(500).json({ error: error.message || 'Failed to update role' });
  }
});

// ================= ADMIN ROLE ROUTES =================

// GET /api/auth/admin/users - Admin user directory
router.get('/admin/users', requireAuth, requireRole(['ADMIN']), async (_req, res) => {
  try {
    const userList = await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return res.json({ success: true, count: userList.length, data: userList });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// GET /api/auth/admin/pending-pgs - PGs awaiting verification
router.get('/admin/pending-pgs', requireAuth, requireRole(['ADMIN']), async (_req, res) => {
  try {
    const pendingList = await db.query.pgs.findMany({
      orderBy: [desc(pgs.createdAt)],
      with: {
        images: true,
        rooms: true,
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return res.json({ success: true, data: pendingList });
  } catch (error: any) {
    console.error('Admin pgs error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch properties' });
  }
});

// PUT /api/auth/admin/verify-pg/:id - Approve or reject PG verification
router.put('/admin/verify-pg/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be PENDING, VERIFIED, or REJECTED' });
    }

    const [updatedPg] = await db
      .update(pgs)
      .set({ verificationStatus: status, updatedAt: new Date() })
      .where(eq(pgs.id, id))
      .returning();

    return res.json({
      success: true,
      message: `Property ${updatedPg.name} status updated to ${status}`,
      data: updatedPg,
    });
  } catch (error: any) {
    console.error('Error verifying PG:', error);
    return res.status(500).json({ error: error.message || 'Failed to update verification status' });
  }
});

export default router;
