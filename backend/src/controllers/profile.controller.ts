import { Response } from 'express';
import prisma from '../utils/prisma';
import { profileSchema } from '../validators/profile.validator';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.financialProfile.findUnique({
      where: { user_id: userId },
    });

    res.json({ success: true, data: { profile } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedData = profileSchema.parse(req.body);

    const profile = await prisma.financialProfile.upsert({
      where: { user_id: userId },
      update: validatedData,
      create: {
        user_id: userId,
        ...validatedData,
      },
    });

    res.json({ success: true, data: { profile } });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
  }
};
