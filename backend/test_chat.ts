import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

async function runTests() {
  console.log('--- Testing Backend -> AI Communication ---');
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

  try {
    const chatRes = await api.post('/chat', 
      { message: 'What is my total spend?' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Backend -> AI Proxy:', chatRes.data.reply ? 'PASS' : 'FAIL');
    console.log('Reply:', chatRes.data.reply);
  } catch (e: any) {
    console.log('Backend -> AI Proxy: FAIL', e.message);
  }
}

runTests();
