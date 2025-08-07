const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEnhancedCoordinates() {
  console.log('🧪 Testing Enhanced Weather Coordinates Endpoint\n');
  
  const testCases = [
    {
      name: 'London',
      lat: 51.5074,
      lon: -0.1276,
      expectedCity: 'London'
    },
    {
      name: 'New York',
      lat: 40.7128,
      lon: -74.0060,
      expectedCity: 'New York'
    },
    {
      name: 'Tokyo',
      lat: 35.6762,
      lon: 139.6503,
      expectedCity: 'Tokyo'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📍 Testing: ${testCase.name} (${testCase.lat}, ${testCase.lon})`);
      
      const response = await axios.get(
        `${BASE_URL}/v1/weather-enhanced/coordinates/${testCase.lat}/${testCase.lon}`
      );
      
      if (response.status === 200) {
        const data = response.data.body;
        
        console.log(`✅ Success!`);
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
        console.log(`❌ Failed with status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 Testing completed!');
}

// Test invalid coordinates
async function testInvalidCoordinates() {
  console.log('🧪 Testing Invalid Coordinates\n');
  
  const invalidTests = [
    { lat: '91', lon: '0', desc: 'Latitude out of range' },
    { lat: '0', lon: '181', desc: 'Longitude out of range' },
    { lat: 'invalid', lon: '0', desc: 'Invalid latitude format' },
    { lat: '0', lon: 'invalid', desc: 'Invalid longitude format' }
  ];
  
  for (const test of invalidTests) {
    try {
      console.log(`📍 Testing: ${test.desc}`);
      const response = await axios.get(
        `${BASE_URL}/v1/weather-enhanced/coordinates/${test.lat}/${test.lon}`
      );
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

// Main function
async function runTests() {
  console.log('🚀 Starting Enhanced Weather Coordinates Tests\n');
  
  try {
    await testEnhancedCoordinates();
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
  testEnhancedCoordinates,
  testInvalidCoordinates,
  runTests
}; 