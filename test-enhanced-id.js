const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEnhancedIdEndpoint() {
  console.log('🧪 Testing Enhanced Weather ID Endpoint\n');
  
  const testCityIds = [
    { id: 2643743, name: 'London' },
    { id: 5128581, name: 'New York' },
    { id: 1850147, name: 'Tokyo' },
    { id: 2988507, name: 'Paris' },
    { id: 3435910, name: 'Buenos Aires' },
    { id: 2147714, name: 'Sydney' }
  ];

  for (const city of testCityIds) {
    try {
      console.log(`📍 Testing city ID for ${city.name}: ${city.id}`);
      
      const response = await axios.get(`${BASE_URL}/v1/weather-enhanced/id/${city.id}`);
      
      if (response.status === 200) {
        console.log(`✅ Success for ${city.name}`);
        
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
        console.log(`❌ Failed for ${city.name}: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${city.name}: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 Enhanced ID testing completed!');
}

// Test invalid city IDs
async function testInvalidCityIds() {
  console.log('🧪 Testing Invalid City IDs\n');
  
  const invalidTests = [
    { id: 'invalid', desc: 'Invalid city ID format' },
    { id: '-123', desc: 'Negative city ID' },
    { id: '0', desc: 'Zero city ID' },
    { id: '999999999', desc: 'Non-existent city ID' },
    { id: '', desc: 'Empty city ID' }
  ];
  
  for (const test of invalidTests) {
    try {
      console.log(`📍 Testing: ${test.desc}`);
      const response = await axios.get(`${BASE_URL}/v1/weather-enhanced/id/${test.id}`);
      console.log(`❌ Should have failed but got status: ${response.status}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Correctly rejected: ${test.desc}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
  }
  
  console.log('🏁 Invalid city ID testing completed!\n');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Enhanced Weather ID Tests\n');
  
  try {
    await testEnhancedIdEndpoint();
    console.log('\n' + '='.repeat(50) + '\n');
    await testInvalidCityIds();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testEnhancedIdEndpoint,
  testInvalidCityIds,
  runTests
}; 