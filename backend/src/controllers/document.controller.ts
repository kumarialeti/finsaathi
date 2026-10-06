import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const documents = await prisma.financialDocument.findMany({
      where: { user_id: userId },
      orderBy: { uploaded_at: 'desc' }
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
};
