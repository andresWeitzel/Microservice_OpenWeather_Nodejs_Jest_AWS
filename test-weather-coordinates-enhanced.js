const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test coordinates for different cities
const testCoordinates = [
  { lat: 51.5074, lon: -0.1276, name: 'London' },
  { lat: 40.7128, lon: -74.0060, name: 'New York' },
  { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
  { lat: 48.8566, lon: 2.3522, name: 'Paris' },
  { lat: -34.6132, lon: -58.3772, name: 'Buenos Aires' },
  { lat: -33.8688, lon: 151.2093, name: 'Sydney' }
];

async function testEnhancedCoordinatesEndpoint() {
  console.log('🧪 Testing Enhanced Weather Coordinates Endpoint\n');
  
  for (const coords of testCoordinates) {
    try {
      console.log(`📍 Testing coordinates for ${coords.name}: ${coords.lat}, ${coords.lon}`);
      
      const response = await axios.get(`${BASE_URL}/v1/weather-enhanced/coordinates/${coords.lat}/${coords.lon}`);
      
      if (response.status === 200) {
        console.log(`✅ Success for ${coords.name}`);
        
        const data = response.data.body;
        
        // Verify enhanced structure
        if (data.location && data.temperature && data.weather && data.atmosphere) {
          console.log(`   📍 Location: ${data.location.city}, ${data.location.country}`);
          console.log(`   🌡️ Temperature: ${data.temperature.celsius}°C / ${data.temperature.fahrenheit}°F`);
          console.log(`   🌤️ Weather: ${data.weather.condition} - ${data.weather.description}`);
          console.log(`   💨 Wind: ${data.wind.description} (${data.wind.speed} m/s)`);
          console.log(`   😌 Comfort: ${data.comfort.level} (Index: ${data.comfort.index})`);
          
          if (data.alerts && data.alerts.length > 0) {
            console.log(`   ⚠️ Alerts: ${data.alerts.length} active`);
          }
          
          if (data.recommendations) {
            console.log(`   👕 Clothing: ${data.recommendations.clothing}`);
            console.log(`   🎯 Activities: ${data.recommendations.activities}`);
          }
        } else {
          console.log(`   ❌ Invalid enhanced data structure`);
        }
      } else {
        console.log(`❌ Failed for ${coords.name}: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${coords.name}: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 Enhanced coordinates testing completed!');
}

// Test invalid coordinates
async function testInvalidCoordinates() {
  console.log('🧪 Testing Invalid Coordinates\n');
  
  const invalidTests = [
    { lat: 'invalid', lon: '123', desc: 'Invalid latitude' },
    { lat: '123', lon: 'invalid', desc: 'Invalid longitude' },
    { lat: '91', lon: '0', desc: 'Latitude out of range' },
    { lat: '0', lon: '181', desc: 'Longitude out of range' },
    { lat: '', lon: '0', desc: 'Missing latitude' },
    { lat: '0', lon: '', desc: 'Missing longitude' }
  ];
  
  for (const test of invalidTests) {
    try {
      console.log(`📍 Testing: ${test.desc}`);
      const response = await axios.get(`${BASE_URL}/v1/weather-enhanced/coordinates/${test.lat}/${test.lon}`);
      console.log(`❌ Should have failed but got status: ${response.status}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Correctly rejected: ${test.desc}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
  }
  
  console.log('🏁 Invalid coordinates testing completed!\n');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Enhanced Weather Coordinates Tests\n');
  
  try {
    await testEnhancedCoordinatesEndpoint();
    console.log('\n' + '='.repeat(50) + '\n');
    await testInvalidCoordinates();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testEnhancedCoordinatesEndpoint,
  testInvalidCoordinates,
  runTests
}; 