import axios from 'axios';

// Helper function to extract city name from user query
function extractCityName(query) {
  // Simple pattern to identify city names - could be enhanced with NLP
  const cityPatterns = [
    /(?:about|for|in|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*).*?(?:pollution|air|aqi|quality|health)/i,
    /\b(Delhi|Mumbai|Bangalore|Hyderabad|Ahmedabad|Chennai|Kolkata|Surat|Pune|Jaipur|Lucknow|Kanpur|Nagpur|Visakhapatnam|Indore|Thane|Bhopal|Patna|Vadodara|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Kalyan-Dombivali|Vasai-Virar|Varanasi|Srinagar|Aurangabad|Dhanbad|Amritsar|Navi Mumbai|Allahabad|Howrah|Ranchi|Jabalpur|Coimbatore|Gwalior|Vijayawada|Jodhpur|Madurai|Rajpur Sonarpur|Hubballi-Dharwad|Chandigarh|Solapur|Bareilly|Guwahati|Shivamogga|Trivandrum|Salem|Kota|Mysore|Raipur|Bhubaneswar|Moradabad|Kochi|Gurgaon|Aligarh|Jalandhar|Tiruchirappalli|Bhubaneswar|Tiruppur|Bhayandar|Ulhasnagar|Bhiwandi|Saharanpur|Warangal|Guntur|Kurnool|Ambattur|Davanagere|Bikaner|Rajahmundry|Kochi|Mangalore|Jamshedpur|Udupi|Noida|Dehradun|Belgaum|Malegaon|Gaya|Jalgaon|Kakinada|Durg-Bhilai Nagar|Parbhani|Nizamabad|Thrissur|Ajmer|Bokaro|Alwar|Bilaspur|Shillong|Kottayam|Kolhapur|Siliguri|Bhatpara)\b/i
  ];
  
  for (const pattern of cityPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      // Clean up the matched text to extract just the city name
      let cityName = match[1].trim();
      // Remove common words that might be incorrectly captured
      cityName = cityName.replace(/(air|pollution|quality|aqi|health|data|information|levels?|risks?|report)/gi, '').trim();
      if (cityName.length > 1) {
        return cityName;
      }
    }
  }
  
  return null;
}

// Helper function to fetch city data
async function fetchCityData(cityName) {
  try {
    // Make a request to the existing city data API
    const response = await axios.post(`${process.env.VERCEL_URL || 'https://cih-sdg-3.vercel.app'}/api/city`, {
      city: cityName
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for city ${cityName}:`, error.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Extract city name from the user's message
    const cityName = extractCityName(message);
    let cityData = null;
    
    if (cityName) {
      console.log(`Detected city in query: ${cityName}`);
      cityData = await fetchCityData(cityName);
    }

    // Prepare the prompt for Gemini
    // Include project context to help the AI understand our air pollution and health data
    let contextPrompt = `You are an AI assistant for the Air Pollution & Health Dashboard project. 
    This project provides air quality data, health risk assessments, and recommendations for cities in India.
    Data includes AQI (Air Quality Index), pollutant levels (PM2.5, PM10, O3, NO2, SO2, CO), 
    health risks, disease correlations, and health recommendations.`;
    
    // Add city-specific data if available
    if (cityData && cityData.city) {
      contextPrompt += `\n\nSpecific data for ${cityData.city}:\n`;
      if (cityData.aqi) {
        contextPrompt += `- AQI: ${cityData.aqi} (${cityData.aqiCategory})\n`;
      }
      if (cityData.pollutants) {
        contextPrompt += `- Pollutant levels:\n`;
        for (const [pollutant, value] of Object.entries(cityData.pollutants)) {
          if (typeof value === 'object' && value.concentration !== undefined) {
            contextPrompt += `  - ${pollutant.toUpperCase()}: ${value.concentration} ${value.unit || ''}\n`;
          } else if (typeof value !== 'object') {
            contextPrompt += `  - ${pollutant.toUpperCase()}: ${value}\n`;
          }
        }
      }
      if (cityData.healthRisk) {
        contextPrompt += `- Health Risk: ${cityData.healthRisk}\n`;
      }
      if (cityData.advisory) {
        contextPrompt += `- Health Advisory: ${cityData.advisory}\n`;
      }
    }
    
    contextPrompt += `\n\nRespond to the user's query based on this context. If the query is about air pollution, health data, 
    or the dashboard functionality, provide helpful information. If it's unrelated, politely redirect to 
    topics relevant to air quality and health.`;

    // Format the conversation history for the API
    const formattedHistory = history.slice(-6); // Use last 3 exchanges (user-assistant pairs)
    
    // Construct the prompt with context and conversation history
    const prompt = `${contextPrompt}\n\nConversation history:\n${formattedHistory.map(h => 
      `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
    ).join('\n')}\n\nUser's new message: ${message}\n\nAssistant:`;

    // Call Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCp7fSLhepFfLtnT35xjslZJEkGrOVLXSg';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topK: 40,
        topP: 0.95,
      }
    });

    const geminiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request.";

    res.status(200).json({ 
      response: geminiResponse.trim(),
      cityData: cityData ? { city: cityData.city, aqi: cityData.aqi, pollutants: cityData.pollutants } : null
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Check if it's an API-related error
    if (error.response) {
      console.error('API Response Error:', error.response.status, error.response.data);
      return res.status(error.response.status).json({ 
        error: `API Error: ${error.response.data.error?.message || 'Failed to get response from Gemini'}` 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}