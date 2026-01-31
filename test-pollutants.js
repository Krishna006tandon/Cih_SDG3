import fetch from 'node-fetch';

async function testPollutants() {
  try {
    console.log('Testing pollutant data for Nagpur...');
    
    const response = await fetch('http://localhost:5000/api/city', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        state: 'Maharashtra',
        city: 'Nagpur'
      })
    });
    
    if (!response.ok) {
      console.error('API Error:', response.status, await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('Response data:');
    console.log('PM2.5:', data.pm25);
    console.log('PM10:', data.pm10);
    console.log('O3:', data.o3);
    console.log('NO2:', data.no2);
    console.log('SO2:', data.so2);
    console.log('CO:', data.co);
    console.log('AQI:', data.aqi);
    console.log('Source:', data.source);
    console.log('Fallback used:', data.fallbackUsed);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPollutants();