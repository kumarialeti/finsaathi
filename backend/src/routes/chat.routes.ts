import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import axios from 'axios';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { message, language } = req.body;
    const userId = (req as any).user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call the Python AI service
    const aiResponse = await axios.post('http://127.0.0.1:8000/analyze', {
      user_id: userId,
      message: message,
      language: language
    });

    res.json(aiResponse.data);
  } catch (error: any) {
    console.error('AI Service Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
