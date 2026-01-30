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
      // For 400 errors, try with "Delhi" as state for NCR cities
      if (error.response?.status === 400) {
        if (city === 'Delhi' || city === 'Gurgaon' || city === 'Noida' || city === 'Ghaziabad') {
          try {
            const response = await axios.get(`${this.baseUrl}/city`, {
              params: {
                city: city,
                state: 'Delhi',
                country: country,
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
            }
          } catch (retryError) {
            // Fall through to original error
          }
        }
        
        // For 400 errors, try nearest city lookup
        if (city === 'Bengaluru') {
          return await this.getNearestCity(12.9716, 77.5946); // Bangalore coordinates
        } else if (city === 'Mumbai') {
          return await this.getNearestCity(19.076, 72.8777);
        } else if (city === 'Chennai') {
          return await this.getNearestCity(13.0827, 80.2707);
        } else if (city === 'Kolkata') {
          return await this.getNearestCity(22.5726, 88.3639);
        }
      }
      
      console.error('AirVisual API Error:', error.message);
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