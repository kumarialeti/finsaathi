import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Profile Routes
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        language: true,
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, phone, language } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        language
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        language: true,
      }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications Routes
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    let prefs = await prisma.notificationPreference.findUnique({
      where: { user_id: userId }
    });
    
    // If no preferences exist, create default
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { user_id: userId }
      });
    }
    res.json(prefs);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/notifications', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { 
      transaction_alerts, 
      budget_alerts, 
      goal_reminders, 
      subscription_reminders, 
      ai_insights, 
      security_alerts 
    } = req.body;

    const prefs = await prisma.notificationPreference.upsert({
      where: { user_id: userId },
      update: {
        transaction_alerts,
        budget_alerts,
        goal_reminders,
        subscription_reminders,
        ai_insights,
        security_alerts
      },
      create: {
        user_id: userId,
        transaction_alerts,
        budget_alerts,
        goal_reminders,
        subscription_reminders,
        ai_insights,
        security_alerts
      }
    });
    res.json(prefs);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accounts Routes
router.get('/accounts', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    // For now, we consider uploaded documents as accounts since this is a manual statement application
    const documents = await prisma.financialDocument.findMany({
      where: { user_id: userId },
      orderBy: { uploaded_at: 'desc' },
      select: {
        id: true,
        file_name: true,
        uploaded_at: true,
        processing_status: true
      }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Security Info
router.get('/security', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    // Just return some basic info since we don't have active session management in DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        created_at: true,
        updated_at: true
      }
    });
    res.json({
      last_password_change: user?.updated_at,
      account_created: user?.created_at
    });
  } catch (error) {
    console.error('Error fetching security info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Account
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    // Prisma cascading deletes will handle related records
    await prisma.user.delete({
      where: { id: userId }
    });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
