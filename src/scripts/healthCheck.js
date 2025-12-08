const axios = require('axios');

async function healthCheck() {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  
  try {
    console.log(`🩺 Verificando saúde da API em ${baseUrl}...`);
    
    // Health endpoint
    const healthRes = await axios.get(`${baseUrl}/health`);
    console.log('✅ Health Check:', healthRes.data);
    
    // API endpoints
    const endpoints = ['/', '/api/gamification/ranking'];
    
    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(`${baseUrl}${endpoint}`);
        console.log(`✅ ${endpoint}: ${res.status}`);
      } catch (err) {
        console.log(`❌ ${endpoint}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ API não está respondendo:', error.message);
    process.exit(1);
  }
}

healthCheck();