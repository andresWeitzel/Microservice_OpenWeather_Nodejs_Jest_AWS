const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testCityIdsModule() {
  console.log('🧪 Testing City IDs Module (Independent)\n');
  
  const testCases = [
    {
      name: 'London',
      country: 'GB',
      desc: 'London, UK (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'London',
      country: null,
      desc: 'London, any country (should find 2 results - UK and Canada)',
      expectedCount: 2
    },
    {
      name: 'Paris',
      country: 'FR',
      desc: 'Paris, France (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Paris',
      country: null,
      desc: 'Paris, any country (should find 2 results - France and US)',
      expectedCount: 2
    },
    {
      name: 'New York',
      country: 'US',
      desc: 'New York, USA (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Tokyo',
      country: 'JP',
      desc: 'Tokyo, Japan (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Sydney',
      country: null,
      desc: 'Sydney, any country (should find 2 results - Australia and Canada)',
      expectedCount: 2
    },
    {
      name: 'Buenos Aires',
      country: 'AR',
      desc: 'Buenos Aires, Argentina (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Madrid',
      country: 'ES',
      desc: 'Madrid, Spain (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Rome',
      country: null,
      desc: 'Rome, any country (should find 2 results - Italy and US)',
      expectedCount: 2
    },
    {
      name: 'Berlin',
      country: 'DE',
      desc: 'Berlin, Germany (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Moscow',
      country: 'RU',
      desc: 'Moscow, Russia (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Beijing',
      country: 'CN',
      desc: 'Beijing, China (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Mumbai',
      country: 'IN',
      desc: 'Mumbai, India (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'São Paulo',
      country: 'BR',
      desc: 'São Paulo, Brazil (should find 1 result)',
      expectedCount: 1
    },
    {
      name: 'Mexico City',
      country: 'MX',
      desc: 'Mexico City, Mexico (should find 1 result)',
      expectedCount: 1
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📍 Testing: ${testCase.desc}`);
      
                   let url;
             if (testCase.country) {
               url = `${BASE_URL}/v1/info/city-ids/${testCase.name}/${testCase.country}`;
             } else {
               url = `${BASE_URL}/v1/info/city-ids/${testCase.name}`;
             }
      
      const response = await axios.get(url);
      
      if (response.status === 200) {
        const data = response.data.body;
        
        console.log(`✅ Success for ${testCase.name}`);
        console.log(`   🔍 Search Query: ${data.searchQuery}`);
        console.log(`   🌍 Country Code: ${data.countryCode}`);
        console.log(`   📊 Total Results: ${data.totalResults}`);
        console.log(`   📋 Limit: ${data.limit}`);
        console.log(`   🗄️ Source: ${data.source}`);
        console.log(`   📅 Database Version: ${data.databaseInfo.version}`);
        console.log(`   📈 Total Cities in DB: ${data.databaseInfo.totalCities}`);
        
        if (data.cities && data.cities.length > 0) {
          console.log(`   🏙️ Cities found:`);
          data.cities.forEach((city, index) => {
            console.log(`      ${index + 1}. ${city.displayName} (ID: ${city.id})`);
            console.log(`         📍 Coordinates: ${city.coordinates.lat}, ${city.coordinates.lon}`);
            if (city.state) {
              console.log(`         🏛️ State: ${city.state}`);
            }
          });
          
          // Verify expected count
          if (data.totalResults === testCase.expectedCount) {
            console.log(`   ✅ Expected count matches: ${data.totalResults}`);
          } else {
            console.log(`   ⚠️ Expected ${testCase.expectedCount} but got ${data.totalResults}`);
          }
        } else {
          console.log(`   ❌ No cities found`);
        }
        
      } else {
        console.log(`❌ Failed for ${testCase.name}: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${testCase.name}: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 City IDs Module testing completed!');
}

// Test with different limits
async function testCityIdsWithLimits() {
  console.log('🧪 Testing City IDs with Different Limits\n');
  
  const testCases = [
    { name: 'London', country: 'GB', limit: 1, desc: 'Limit 1' },
    { name: 'Paris', country: null, limit: 3, desc: 'Limit 3 (should get 2)' },
    { name: 'Rome', country: null, limit: 5, desc: 'Limit 5 (should get 2)' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📍 Testing: ${testCase.desc} for ${testCase.name}`);
      
              let url;
        if (testCase.country) {
          url = `${BASE_URL}/v1/info/city-ids/${testCase.name}/${testCase.country}/${testCase.limit}`;
        } else {
          url = `${BASE_URL}/v1/info/city-ids/${testCase.name}/any/${testCase.limit}`;
        }
      
      const response = await axios.get(url);
      
      if (response.status === 200) {
        const data = response.data.body;
        console.log(`✅ Success! Found ${data.totalResults} cities (limit: ${data.limit})`);
        
        data.cities.forEach((city, index) => {
          console.log(`   ${index + 1}. ${city.displayName} (ID: ${city.id})`);
        });
      } else {
        console.log(`❌ Failed: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 City IDs with limits testing completed!');
}

// Test edge cases
async function testCityIdsEdgeCases() {
  console.log('🧪 Testing City IDs Edge Cases\n');
  
  const edgeCases = [
    { name: 'A', desc: 'Single character search' },
    { name: 'X', desc: 'Non-existent city' },
    { name: '123', desc: 'Numeric search' },
    { name: 'Lon', desc: 'Partial city name' },
    { name: 'Par', desc: 'Partial city name' }
  ];
  
  for (const testCase of edgeCases) {
    try {
      console.log(`📍 Testing: ${testCase.desc} - "${testCase.name}"`);
      
      const response = await axios.get(`${BASE_URL}/v1/info/city-ids/${testCase.name}`);
      
      if (response.status === 200) {
        const data = response.data.body;
        console.log(`✅ Success! Found ${data.totalResults} cities`);
        
        if (data.cities.length > 0) {
          console.log(`   🏙️ First result: ${data.cities[0].displayName} (ID: ${data.cities[0].id})`);
        }
      } else {
        console.log(`❌ Failed: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 City IDs edge cases testing completed!\n');
}

// Test database statistics
async function testDatabaseStats() {
  console.log('🧪 Testing Database Statistics\n');
  
  try {
    // Test a known city to get database info
    const response = await axios.get(`${BASE_URL}/v1/info/city-ids/London`);
    
    if (response.status === 200) {
      const data = response.data.body;
      console.log(`📊 Database Information:`);
      console.log(`   📅 Version: ${data.databaseInfo.version}`);
      console.log(`   📈 Total Cities: ${data.databaseInfo.totalCities}`);
      console.log(`   📅 Last Updated: ${data.databaseInfo.lastUpdated}`);
      console.log(`   🗄️ Source: ${data.source}`);
    }
    
  } catch (error) {
    console.log(`❌ Error getting database stats: ${error.message}`);
  }
  
  console.log('🏁 Database statistics testing completed!\n');
}

// Test invalid parameters
async function testInvalidParameters() {
  console.log('🧪 Testing Invalid Parameters\n');
  
      const invalidTests = [
      { url: '/v1/info/city-ids/', desc: 'Missing city name' },
      { url: '/v1/info/city-ids/London/GB/15', desc: 'Invalid limit (too high)' },
      { url: '/v1/info/city-ids/London/GB/0', desc: 'Invalid limit (zero)' },
      { url: '/v1/info/city-ids/London/GB/invalid', desc: 'Invalid limit (non-numeric)' }
    ];
  
  for (const test of invalidTests) {
    try {
      console.log(`📍 Testing: ${test.desc}`);
      const response = await axios.get(`${BASE_URL}${test.url}`);
      console.log(`❌ Should have failed but got status: ${response.status}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Correctly rejected: ${test.desc}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
  }
  
  console.log('🏁 Invalid parameters testing completed!\n');
}

// Main test function
async function runModuleTests() {
  console.log('🚀 Starting City IDs Module Tests\n');
  
  try {
    await testCityIdsModule();
    console.log('\n' + '='.repeat(50) + '\n');
    await testCityIdsWithLimits();
    console.log('\n' + '='.repeat(50) + '\n');
    await testCityIdsEdgeCases();
    console.log('\n' + '='.repeat(50) + '\n');
    await testDatabaseStats();
    console.log('\n' + '='.repeat(50) + '\n');
    await testInvalidParameters();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runModuleTests();
}

module.exports = {
  testCityIdsModule,
  testCityIdsWithLimits,
  testCityIdsEdgeCases,
  testDatabaseStats,
  testInvalidParameters,
  runModuleTests
}; 