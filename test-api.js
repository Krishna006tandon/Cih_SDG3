const fetch = require('node-fetch');

async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/api/city', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: 'Maharashtra',
        city: 'Mumbai'
      })
    });
    
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();