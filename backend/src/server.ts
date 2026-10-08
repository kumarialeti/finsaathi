import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import profileRoutes from './routes/profile.routes';
import importRoutes from './routes/import.routes';
import chatRoutes from './routes/chat.routes';
import analyticsRoutes from './routes/analytics.routes';
import budgetRoutes from './routes/budget.routes';
import documentRoutes from './routes/document.routes';
import settingsRoutes from './routes/settings.routes';

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/import', importRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fin-saathi-backend' });
});

app.listen(port, () => {
  console.log(`Backend service listening on port ${port}`);
});
