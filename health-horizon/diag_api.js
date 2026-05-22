const axios = require('axios');
const BASE_URL = 'http://localhost:8081/api/v1';

async function test() {
  try {
    // 1. Register a test user
    const timestamp = Date.now();
    const email = `diag_${timestamp}@test.com`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      fullName: 'Diagnostic User',
      email: email,
      password: 'Password123!',
      role: 'PATIENT'
    });
    
    console.log('Registration Success:', regRes.data);
    const token = regRes.data.token;

    // 2. Complete Profile
    // We simulate the frontend dateOfBirth calculation
    const dob = new Date(new Date().setFullYear(new Date().getFullYear() - 30)).toISOString().split('T')[0];
    
    try {
      const profRes = await axios.post(`${BASE_URL}/patients`, {
        fullName: 'Diagnostic User',
        age: '30',
        gender: 'MALE',
        height: '180',
        weight: '75',
        healthGoal: 'Better Sleep',
        dateOfBirth: dob,
        medicalConditions: 'Better Sleep'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Profile Success:', profRes.data);
    } catch (err) {
      console.error('Profile Error:', err.response?.status, err.response?.data);
    }
  } catch (err) {
    console.error('General Error:', err.message);
  }
}

test();
