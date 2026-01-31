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
    
    // If no city detected but query is about air quality/pollution, try common Indian cities
    let fallbackCity = null;
    if (!cityName && (message.toLowerCase().includes('air quality') || 
                      message.toLowerCase().includes('pollution') || 
                      message.toLowerCase().includes('aqi') ||
                      message.toLowerCase().includes('pm2.5') ||
                      message.toLowerCase().includes('health'))) {
      fallbackCity = 'Delhi'; // Default to Delhi for general air quality queries
    }
    
    if (cityName || fallbackCity) {
      const targetCity = cityName || fallbackCity;
      console.log(`Fetching data for city: ${targetCity}`);
      cityData = await fetchCityData(targetCity);
    }

    // Prepare the prompt for Gemini
    // Include project context to help the AI understand our air pollution and health data
    let contextPrompt = `You are an AI assistant for the Air Pollution & Health Dashboard project. 
    This project provides real-time air quality data, health risk assessments, and recommendations for cities in India.
    Data includes AQI (Air Quality Index), pollutant levels (PM2.5, PM10, O3, NO2, SO2, CO), 
    health risks, disease correlations, and health recommendations.
    
    IMPORTANT: When users ask about air quality, pollution levels, or health conditions, 
    ALWAYS include the specific numerical data (AQI values, pollutant concentrations) in your response.
    Format your answers with clear data points like:
    - "The current AQI in [city] is [value] ([category])"
    - "PM2.5 levels are at [value] μg/m³"
    - "Health risk is classified as [risk level]"
    
    Use the provided city data to give specific, data-driven answers rather than general information.`;
    
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
    
    contextPrompt += `\n\nRespond to the user's query based on this context. CRITICAL INSTRUCTIONS:
    1. ALWAYS include specific numerical data (AQI values, pollutant levels) when discussing air quality
    2. Use the exact values from the provided city data
    3. Format responses clearly with data points
    4. If the query is about air pollution, health data, or the dashboard functionality, provide helpful information
    5. If it's unrelated, politely redirect to topics relevant to air quality and health
    6. Be concise but data-rich in your responses`;
    
    // If we have city data, make it even more prominent in the context
    if (cityData && cityData.city) {
      contextPrompt += `\n\nIMPORTANT: You have access to current air quality data for ${cityData.city}. 
    Use these exact values in your response:
    - AQI: ${cityData.aqi} (${cityData.aqiCategory})
    - Health Risk: ${cityData.healthRisk}
    Include these numbers prominently in your answer.`;
    }
    
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