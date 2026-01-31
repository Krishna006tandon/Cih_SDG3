import axios from 'axios';

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...');
    
    const response = await axios.post('http://localhost:5000/api/gemini/chat', {
      message: "What is the air quality in Delhi?",
      history: []
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
    console.log('✅ Gemini API working correctly');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGeminiAPI();