#!/usr/bin/env node

/**
 * Script de prueba para verificar todos los endpoints de weather
 * Ejecutar: node test-weather-endpoints.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Función para imprimir con colores
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para hacer petición HTTP
async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    print(`\n${colors.bold}🧪 Probando: ${name}${colors.reset}`, 'blue');
    print(`URL: ${url}`, 'yellow');
    
    const response = await axios.get(url);
    
    if (response.status === expectedStatus) {
      print(`✅ ${name} - EXITOSO (${response.status})`, 'green');
      return true;
    } else {
      print(`❌ ${name} - ERROR: Status ${response.status} (esperado ${expectedStatus})`, 'red');
      return false;
    }
  } catch (error) {
    print(`❌ ${name} - ERROR: ${error.message}`, 'red');
    return false;
  }
}

// Función principal de pruebas
async function runTests() {
  print('🚀 INICIANDO PRUEBAS DE ENDPOINTS DE WEATHER', 'bold');
  print('=' * 50, 'blue');
  
  const tests = [
    {
      name: 'Weather por Ciudad',
      url: `${BASE_URL}/v1/weather/location/London`
    },
    {
      name: 'Weather Enhanced por Ciudad',
      url: `${BASE_URL}/v1/weather-enhanced/location/London`
    },
    {
      name: 'Weather por Coordenadas',
      url: `${BASE_URL}/v1/weather/coordinates/51.5074/-0.1276`
    },
    {
      name: 'Weather por ID de Ciudad',
      url: `${BASE_URL}/v1/weather/id/2643743`
    },
    {
      name: 'Weather por Código Postal (con país)',
      url: `${BASE_URL}/v1/weather/zipcode/10001/us`
    },
    {
      name: 'Weather por Código Postal (sin país)',
      url: `${BASE_URL}/v1/weather/zipcode/10001`
    },
    {
      name: 'Weather con Unidades Métricas',
      url: `${BASE_URL}/v1/weather/units/Paris/metric`
    },
    {
      name: 'Weather con Unidades Imperiales',
      url: `${BASE_URL}/v1/weather/units/New%20York/imperial`
    },
    {
      name: 'Weather con Idioma Español',
      url: `${BASE_URL}/v1/weather/language/Madrid/es`
    },
    {
      name: 'Weather con Idioma Francés',
      url: `${BASE_URL}/v1/weather/language/Paris/fr`
    },
    {
      name: 'Weather Combinado (todos los parámetros)',
      url: `${BASE_URL}/v1/weather/combined/Tokyo/metric/es`
    },
    {
      name: 'Weather Combinado (solo ubicación)',
      url: `${BASE_URL}/v1/weather/combined/London`
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    // Pequeña pausa entre pruebas para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resumen final
  print('\n' + '=' * 50, 'blue');
  print('📊 RESUMEN DE PRUEBAS', 'bold');
  print(`✅ Exitosas: ${passed}`, 'green');
  print(`❌ Fallidas: ${failed}`, 'red');
  print(`📈 Total: ${passed + failed}`, 'blue');
  
  if (failed === 0) {
    print('\n🎉 ¡TODAS LAS PRUEBAS PASARON!', 'green');
  } else {
    print('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow');
  }
}

// Manejo de errores
process.on('unhandledRejection', (error) => {
  print(`❌ Error no manejado: ${error.message}`, 'red');
  process.exit(1);
});

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    print('✅ Servidor detectado y funcionando', 'green');
    return true;
  } catch (error) {
    print('❌ No se puede conectar al servidor', 'red');
    print('💡 Asegúrate de que el servidor esté corriendo con: npm start', 'yellow');
    return false;
  }
}

// Función principal
async function main() {
  print('🔍 Verificando conexión al servidor...', 'blue');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    print(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint }; 