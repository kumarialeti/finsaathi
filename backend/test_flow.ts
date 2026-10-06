import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

async function runTests() {
  console.log('--- Testing Main User Flow ---');
  let token = '';

  try {
    const loginRes = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    token = loginRes.data.data.token;
  } catch (e: any) {
    console.log('Login failed, aborting.', e.message);
    return;
  }

  // 1. Add Transactions
  try {
    await api.post('/transactions', { amount: 120, category: 'Food', description: 'Grocery', date: new Date().toISOString(), transaction_type: 'EXPENSE' }, { headers: { Authorization: `Bearer ${token}` } });
    await api.post('/transactions', { amount: 200, category: 'Transport', description: 'Uber', date: new Date().toISOString(), transaction_type: 'EXPENSE' }, { headers: { Authorization: `Bearer ${token}` } });
    await api.post('/transactions', { amount: 5000, category: 'Income', description: 'Salary', date: new Date().toISOString(), transaction_type: 'INCOME' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Add Transactions: PASS');
  } catch (e: any) {
    console.log('Add Transactions: FAIL', e.message);
  }

  // 2. View Transaction History
  try {
    const txRes = await api.get('/transactions', { headers: { Authorization: `Bearer ${token}` } });
    if (txRes.data.data.length >= 3) {
      console.log('View Transactions: PASS');
    } else {
      console.log('View Transactions: FAIL (not enough tx)');
    }
  } catch (e: any) {
    console.log('View Transactions: FAIL', e.message);
  }

  // 3. AI Financial Questions
  try {
    const chatRes = await api.post('/chat', 
      { message: 'What is my total spend in the Food category?' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('AI Question:', chatRes.data.reply ? 'PASS' : 'FAIL');
    console.log('AI Reply:', chatRes.data.reply);
  } catch (e: any) {
    console.log('AI Question: FAIL', e.message);
  }
}

runTests();
