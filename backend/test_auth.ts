import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

async function runTests() {
  console.log('--- Testing Authentication ---');
  let token = '';

  try {
    // 1. Register
    const registerRes = await api.post('/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Register:', registerRes.data.success ? 'PASS' : 'FAIL');
  } catch (e: any) {
    if (e.response && e.response.status === 400) {
      console.log('Register: PASS (already registered)');
    } else {
      console.log('Register: FAIL', e.message);
    }
  }

  try {
    // 2. Login
    const loginRes = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    if (loginRes.data.success && loginRes.data.data.token) {
      console.log('Login:', 'PASS');
      token = loginRes.data.data.token;
    } else {
      console.log('Login:', 'FAIL');
    }
  } catch (e: any) {
    console.log('Login: FAIL', e.message);
  }

  try {
    // 3. Protected Route
    const profileRes = await api.get('/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Protected Route (Profile):', profileRes.data.success ? 'PASS' : 'FAIL');
  } catch (e: any) {
    console.log('Protected Route (Profile): FAIL', e.message);
  }

  try {
    // 4. Invalid Login
    await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    console.log('Invalid Login:', 'FAIL (Should have thrown error)');
  } catch (e: any) {
    if (e.response && e.response.status === 401) {
      console.log('Invalid Login:', 'PASS');
    } else {
      console.log('Invalid Login: FAIL', e.message);
    }
  }
}

runTests();
