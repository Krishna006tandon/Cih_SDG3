AirVisual API
Interested in using AirVisual's most comprehensive global air quality data for your own application? You are at the right place! Let's get you started.

First of all, please refer to the air quality API page on our website, in order to get familiar with our plans and features.

At any moment, feel free to contact us if you have any questions, would like to trial a particular plan, or any other inquiries. We are always happy to hear from you!

Get started
The only thing you need to start using our service is an API key, to obtain one for free please go to this page.

Once you have it, you need to put it everywhere you see the {{YOUR_API_KEY}} string, either directly throught Postman (recommended) using global variables, in your browser or any other system/language you may use.

HTTPS support
AirVisual API now supports HTTPS! In order to enable this feature, just prefix your request with https://... instead of http://...

Important notes
Stations around the world have update cycles that are all different from each other.

Stations are updated only once per hour.

The API returns calculated AQI for each pollutant and for the station (main pollutant).

The API returns 2 types of AQI: US AQI (EPA) and Chinese AQI.

Stations may occasionally have updated information. For example, their GPS coordinates may be adjusted or their name changed. Make sure your system or apps support the station info updates.

If a station doesn’t return pollution values, it means the data wasn’t published for that particular hour.

Pollutants do not always have the same concentration units. Sometimes CO is reported in µg/m3 and sometimes in ppm. However, PM2.5 and PM10 are always reported in µg/m3.

Return codes
Below are a few example of return codes you may get. This list is not exhaustive.

success: returned when JSON file was generated successfully.

call_limit_reached: returned when minute/monthly limit is reached.

api_key_expired: returned when API key is expired.

incorrect_api_key: returned when using wrong API key.

ip_location_failed: returned when service is unable to locate IP address of request.

no_nearest_station: returned when there is no nearest station within specified radius.

feature_not_available: returned when call requests a feature that is not available in chosen subscription plan.

too_many_requests: returned when more than 10 calls per second are made.

Detailed response example
View More
Plain Text
{
  "status": "success",
  "data": {
    "name": "Eilat Harbor",
    "city": "Eilat",
    "state": "South District",
    "country": "Israel",
    "location": {
      "type": "Point",
      "coordinates": [
        34.939443,
        29.531814
      ]
    },
    "forecasts": [ //object containing forecast information
      {
        "ts": "2017-02-01T03:00:00.000Z", //timestamp
        "aqius": 21, //AQI value based on US EPA standard
        "aqicn": 7, //AQI value based on China MEP standard
        "tp": 33, //temperature in Celsius
        "tp_min": 33, //minimum temperature in Celsius
        "pr": 976, //atmospheric pressure in hPa
        "hu": 62, //humidity %
        "ws": 3, //wind speed (m/s)
        "wd": 313, //wind direction, as an angle of 360° (N=0, E=90, S=180, W=270)
        "ic": "10n" //weather icon code, see below for icon index
        "pop": 0, // probability of precipitation %
        "pm10": 183.05,
        "pm25": 66.96
        "conc": 45.71, // concentration for pm25,we keep 2 decimals
        "heatIndex": 40 // apparent temperature in Celsius, calculated from temperature and relative humidity, following https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml 
      }, 
    … // contains more forecast data for upcoming 76 hours
    ],
    "current": {
      "weather": {
        "ts": "2017-02-01T01:00:00.000Z", //timestamp
        "tp": 36, //temperature in Celsius
        "pr": 1020, //atmospheric pressure in hPa
        "hu": 38, //humidity %
        "ws": 2, //wind speed (m/s)
        "wd": 320, //wind direction, as an angle of 360° (N=0, E=90, S=180, W=270)
        "ic": "01n", //weather icon code, see below for icon index
        "heatIndex": 38 // apparent temperature in Celsius, calculated from temperature and relative humidity, following https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml 
      },
      "pollution": {
        "ts": "2017-02-01T01:15:00.000Z", //timestamp
        "aqius": 18, //AQI value based on US EPA standard
        "mainus": "p1", //main pollutant for US AQI
        "aqicn": 20, //AQI value based on China MEP standard
        "maincn": "p1", //main pollutant for Chinese AQI
        "p1": { //pollutant details, concentration and appropriate AQIs
          "conc": 20,
          "aqius": 18,
          "aqicn": 20
        }
      }
    },
    "forecasts_daily": [
      {
        "ts": "2025-08-06T00:00:00.000Z",
        "tp": 36,
        "tp_min": 25,
        "pr": 1002,
        "hu": 47,
        "ws": 2,
        "wd": 347,
        "pop": 80,
        "ic": "03d",
        "heatIndex": 41,
        "aqius": 126,
        "aqicn": 70
      },
      ... // contains more daily forecast data for next 7 days
    ],
    "history": { //object containing weather and pollution history information
      "weather": [
        {
          "ts": "2017-02-01T01:00:00.000Z",
          "tp": 12,
          "pr": 1020,
          "hu": 62,
          "ws": 2,
          "wd": 320,
          "ic": "01n"
        },
        … // contains more weather historical data for past 48 hours
      ]
      "pollution": [
        {
          "ts": "2017-02-01T01:15:00.000Z",
          "aqius": 18,
          "mainus": "p1",
          "aqicn": 20,
          "maincn": "p1",
          "p1": {
            "conc": 20,
            "aqius": 18,
            "aqicn": 20
          }
        },
      … // contains more pollution historical data for past 48 hours
      ]
    },
    "units": { //object containing units information
      "p2": "ugm3", //pm2.5
      "p1": "ugm3", //pm10
      "o3": "ppb", //Ozone O3
      "n2": "ppb", //Nitrogen dioxide NO2 
      "s2": "ppb", //Sulfur dioxide SO2 
      "co": "ppm" //Carbon monoxide CO 
    }
  }
}
Weather icon index

View More
Description	Name	Icon
clear sky (day)	01d.png	

clear sky (night)	01n.png	

few clouds (day)	02d.png	

few clouds (night)	02n.png	

scattered clouds	03d.png	

broken clouds	04d.png	

shower rain	09d.png	

rain (day time)	10d.png	

rain (night time)	10n.png	

thunderstorm	11d.png	

snow	13d.png	

mist	50d.png	

Changelog
Version 2.1.3 08/09/2025
Rename heat_index to heatIndex
Version 2.1.2 06/08/2025
Now support heat index as a “felt temperature” for stations/cities as field “heatIndex”, calculated from temperature and relative humidity, following the definition from NOAA (U.S. National Oceanic and Atmospheric Administration).
Version 2.1.1 27/09/2017
Now dynamically hides states/countries which have no active stations

Deprecated local_name field.

Version 2.1 15/09/2017
Moved documentation onto Postman Docs system.

Added HTTPS support.

Create new endpoint countries.

Create new endpoint states.

Create new endpointcities.

Create new endpointstations.

Create new endpointstation (startup api plan and above).

Improve city_ranking endpoint.

Version 2.0 06/02/2017
Consolidates multiple API calls and provides better structure to API response.

Structure is controlled by the subscription plan.

Create changelog

Create new endpoint nearest_city.

Create new endpoint city.

Create new endpoint nearest_station (startup api plan and above).

Create new endpoint city_ranking (enterprise only).

GET
Get specified city data
http://api.airvisual.com/v2/city?city={{CITY_NAME}}&state={{STATE_NAME}}&country={{COUNTRY_NAME}}&key={{YOUR_API_KEY}}
Return specified city's data object.

Values returned in the object depends on you API plan, please refer to the API page on our website to check which values and level of detail your API plan allows you to access.

Parameters
station: station's English name, can be found using the respective listing endpoint.

city: city's English name, can be found using the respective listing endpoint.

state: state's English name, can be found using the respective listing endpoint.

country: country's English name, can be found using the respective listing endpoint.

PARAMS
city
{{CITY_NAME}}

state
{{STATE_NAME}}

country
{{COUNTRY_NAME}}

key
{{YOUR_API_KEY}}

Example Request
Beijing, China
View More
curl
curl --location -g 'http://api.airvisual.com/v2/city?city=Beijing&state=Beijing&country=China&key={{YOUR_API_KEY}}'
200 OK
Example Response
Body
Headers (10)
View More
json
{
  "status": "success",
  "data": {
    "city": "Beijing",
    "state": "Beijing",
    "country": "China",
    "location": {
      "type": "Point",
      "coordinates": [
        116.462153,
        39.941674
      ]
    },
    "current": {
      "pollution": {
        "ts": "2025-09-08T08:00:00.000Z",
        "aqius": 57,
        "mainus": "o3",
        "aqicn": 44,
        "maincn": "o3",
        "p2": {
          "conc": 9,
          "aqius": 50,
          "aqicn": 13
        },
        "p1": {
          "conc": 28,
          "aqius": 26,
          "aqicn": 28
        },
        "o3": {
          "conc": 140,
          "aqius": 57,
          "aqicn": 44
        },
        "n2": {
          "conc": 10,
          "aqius": 5,
          "aqicn": 5
        },
        "s2": {
          "conc": 3,
          "aqius": 1,
          "aqicn": 3
        },
        "co": {
          "conc": 300,
          "aqius": 3,
          "aqicn": 3
        }
      },
      "weather": {
        "ts": "2025-09-08T08:00:00.000Z",
        "ic": "01d",
        "hu": 30,
        "pr": 1008,
        "tp": 31,
        "wd": 178,
        "ws": 4.54,
        "heatIndex": 30
      }
    },
    "units": {
      "p2": "ugm3",
      "p1": "ugm3",
      "o3": "ugm3",
      "n2": "ugm3",
      "s2": "ugm3",
      "co": "ugm3",
      "pm25": "ugm3",
      "pm10": "ugm3"
    }
  }
}
Enterprise
GET
Get global city ranking
http://api.airvisual.com/v2/city_ranking?key={{YOUR_API_KEY}}&sort=&country={{COUNTRY_NAME}}
Return a sorted array (highest to lowest AQI) of selected major cities in the world.

For each city you will receive its current AQI, in US and Chinese standard.

PARAMS
key
{{YOUR_API_KEY}}

sort
Sort cities by air quality value:

asc = Sort by cleanest cities

desc = Sort by most pollutet cities ( default value )

country
{{COUNTRY_NAME}}

Filter cities by country ( Optional )

Allowed values: Thailand | USA | Canada

If empty or invalid value will return all cities

Example Request
All
curl
curl --location -g 'http://api.airvisual.com/v2/city_ranking?key={{YOUR_API_KEY}}'
200 OK
Example Response
Body
Headers (10)
View More
json
{
  "status": "success",
  "data": [
    {
      "city": "Portland",
      "state": "Oregon",
      "country": "USA",
      "ranking": {
        "current_aqi": 183,
        "current_aqi_cn": 154
      }
    },
    {
      "city": "Eugene",