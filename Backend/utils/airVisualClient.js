import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class AirVisualClient {
  constructor() {
    this.apiKey = process.env.AIRVISUAL_API_KEY;
    this.baseUrl = process.env.AIRVISUAL_API_URL || 'https://api.airvisual.com/v2';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.lastRequestTime = 0;
    this.requestDelay = 1000; // 1 second between requests
    
    // Validate API key on initialization
    if (!this.apiKey || this.apiKey === 'your-airvisual-api-key-here') {
      console.warn('⚠️ AirVisual API key not configured. Using static fallback data only.');
      console.warn('   To get real-time data, sign up at: https://www.airvisual.com/api');
    }
  }

  // Get city air quality data
  async getCityData(city, state, country = 'India') {
    const cacheKey = `city_${city}_${state}_${country}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/city`, {
        params: {
          city: city,
          state: state,
          country: country,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.status === 'success') {
        const data = this.transformCityData(response.data.data);
        // Cache the result
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        return data;
      } else {
        throw new Error(`API Error: ${response.data.data || response.data.message}`);
      }
    } catch (error) {
      console.error(`❌ AirVisual API Error for ${city}, ${state}, ${country}:`, error.message);
      
      // Handle 400 errors with better fallback logic
      if (error.response?.status === 400) {
        console.log(`🔄 Handling 400 error for ${city}, ${state}`);
        
        // Try nearest city lookup for major cities
        const cityCoordinates = {
          'Delhi': [28.6139, 77.209],
          'Mumbai': [19.076, 72.8777],
          'Bengaluru': [12.9716, 77.5946],
          'Chennai': [13.0827, 80.2707],
          'Kolkata': [22.5726, 88.3639],
          'Hyderabad': [17.385, 78.4867],
          'Pune': [18.5204, 73.8567],
          'Ahmedabad': [23.0225, 72.5714],
          'Jaipur': [26.9124, 75.7873],
          'Lucknow': [26.8467, 80.9462],
          'Kanpur': [26.4499, 80.3319],
          'Nagpur': [21.1458, 79.0882],
          'Indore': [22.7196, 75.8577],
          'Thane': [19.2183, 72.9781],
          'Bhopal': [23.2599, 77.4126],
          'Visakhapatnam': [17.6868, 83.2185],
          'Patna': [25.5941, 85.1376],
          'Vadodara': [22.3072, 73.1812],
          'Ghaziabad': [28.6692, 77.4538],
          'Ludhiana': [30.901, 75.8573],
          'Agra': [27.1767, 78.0081],
          'Nashik': [19.9975, 73.7898],
          'Faridabad': [28.4089, 77.3178],
          'Meerut': [28.9845, 77.7064],
          'Rajkot': [22.3039, 70.8022],
          'Varanasi': [25.3176, 82.9739],
          'Srinagar': [34.0837, 74.7973],
          'Aurangabad': [19.8762, 75.3433],
          'Dhanbad': [23.7957, 86.4304],
          'Amritsar': [31.634, 74.8723],
          'Allahabad': [25.4358, 81.8463],
          'Ranchi': [23.3441, 85.3096],
          'Coimbatore': [11.0168, 76.9558],
          'Jabalpur': [23.1815, 79.9864],
          'Gwalior': [26.2183, 78.1828],
          'Vijayawada': [16.5062, 80.648],
          'Jodhpur': [26.2389, 73.0243],
          'Madurai': [9.9252, 78.1198],
          'Raipur': [21.2514, 81.6296],
          'Kota': [25.2138, 75.8648],
          'Chandigarh': [30.7333, 76.7794],
          'Guwahati': [26.1445, 91.7362],
          'Solapur': [17.6599, 75.9064],
          'Hubli': [15.3647, 75.124],
          'Tiruchirappalli': [10.7905, 78.7047],
          'Bareilly': [28.367, 79.4304],
          'Mysore': [12.2958, 76.6394],
          'Tiruppur': [11.1085, 77.3411],
          'Gurgaon': [28.4595, 77.0266],
          'Noida': [28.5355, 77.391],
          'Kochi': [9.9312, 76.2673],
          'Mangalore': [12.9141, 74.856],
          'Dehradun': [30.3165, 78.0322],
          'Bhubaneswar': [20.2961, 85.8245],
          'Surat': [21.1702, 72.8311]
        };
        
        const coords = cityCoordinates[city];
        if (coords) {
          console.log(`📍 Trying nearest city lookup for ${city} at coordinates [${coords[0]}, ${coords[1]}]`);
          try {
            return await this.getNearestCity(coords[0], coords[1]);
          } catch (nearestError) {
            console.error(`❌ Nearest city lookup failed for ${city}:`, nearestError.message);
          }
        }
      }
      
      // If we have an API key issue, provide clear error message
      if (error.response?.status === 403 || error.message.includes('API key')) {
        console.error('🔑 Invalid or missing AirVisual API key. Please check your .env file.');
      }
      
      throw error;
    }
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  // Get nearest city data by coordinates
  async getNearestCity(lat, lon) {
    await this.waitForRateLimit();
    
    const cacheKey = `nearest_${lat}_${lon}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/nearest_city`, {
        params: {
          lat: lat,
          lon: lon,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.status === 'success') {
        const data = this.transformCityData(response.data.data);
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        return data;
      } else {
        throw new Error(`API Error: ${response.data.data || response.data.message}`);
      }
    } catch (error) {
      console.error('AirVisual API Error:', error.message);
      throw error;
    }
  }

  // Get all available countries
  async getCountries() {
    try {
      const response = await axios.get(`${this.baseUrl}/countries`, {
        params: { key: this.apiKey },
        timeout: 10000
      });
      return response.data.data;
    } catch (error) {
      console.error('AirVisual API Error:', error.message);
      throw error;
    }
  }

  // Get all available states for a country
  async getStates(country) {
    try {
      const response = await axios.get(`${this.baseUrl}/states`, {
        params: { country: country, key: this.apiKey },
        timeout: 10000
      });
      return response.data.data;
    } catch (error) {
      console.error('AirVisual API Error:', error.message);
      throw error;
    }
  }

  // Get all available cities for a state
  async getCities(state, country = 'India') {
    try {
      const response = await axios.get(`${this.baseUrl}/cities`, {
        params: { state: state, country: country, key: this.apiKey },
        timeout: 10000
      });
      return response.data.data;
    } catch (error) {
      console.error('AirVisual API Error:', error.message);
      throw error;
    }
  }

  // Transform AirVisual API response to our format
  transformCityData(apiData) {
    const current = apiData.current;
    if (!current || !current.pollution) {
      throw new Error('Invalid API response: missing pollution data');
    }

    const pollution = current.pollution;
    const weather = current.weather || {};

    // Map main pollutants
    const mainPollutant = this.mapMainPollutant(pollution.mainus);
    
    return {
      city: apiData.city,
      state: apiData.state,
      country: apiData.country,
      coordinates: apiData.location?.coordinates || [0, 0],
      aqi: pollution.aqius || 0,
      mainPollutant: mainPollutant,
      pollutants: {
        pm25: pollution.p2 ? {
          concentration: pollution.p2.conc,
          aqi: pollution.p2.aqius
        } : { concentration: 0, aqi: 0 },
        pm10: pollution.p1 ? {
          concentration: pollution.p1.conc,
          aqi: pollution.p1.aqius
        } : { concentration: 0, aqi: 0 },
        o3: pollution.o3 ? {
          concentration: pollution.o3.conc,
          aqi: pollution.o3.aqius
        } : { concentration: 0, aqi: 0 },
        no2: pollution.n2 ? {
          concentration: pollution.n2.conc,
          aqi: pollution.n2.aqius
        } : { concentration: 0, aqi: 0 },
        so2: pollution.s2 ? {
          concentration: pollution.s2.conc,
          aqi: pollution.s2.aqius
        } : { concentration: 0, aqi: 0 },
        co: pollution.co ? {
          concentration: pollution.co.conc,
          aqi: pollution.co.aqius
        } : { concentration: 0, aqi: 0 }
      },
      weather: {
        temperature: weather.tp || 0,
        humidity: weather.hu || 0,
        pressure: weather.pr || 0,
        windSpeed: weather.ws || 0,
        windDirection: weather.wd || 0,
        heatIndex: weather.heatIndex || 0
      },
      timestamp: new Date(pollution.ts || Date.now()).toISOString()
    };
  }

  // Map AirVisual main pollutant codes to our format
  mapMainPollutant(mainus) {
    const pollutantMap = {
      'p2': 'PM2.5',
      'p1': 'PM10',
      'o3': 'O3',
      'n2': 'NO2',
      's2': 'SO2',
      'co': 'CO'
    };
    return pollutantMap[mainus] || 'Unknown';
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }
}

export default new AirVisualClient();