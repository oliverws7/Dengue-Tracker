const axios = require('axios');

// Cores para o terminal
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

async function healthCheck() {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  const timeout = 5000; // 5 segundos de timeout máximo
  
  // Lista de rotas para verificar
  const endpoints = [
    { path: '/health', critical: true }, // Se falhar, aborta tudo
    { path: '/', critical: false }, // Pode ser 404, não é crítico
    { path: '/api/gamification/ranking', critical: true },
    { path: '/api/reports/public/stats', critical: true }
  ];

  let hasErrors = false;

  console.log(`${colors.cyan}🩺 Iniciando Health Check em: ${baseUrl}${colors.reset}\n`);

  // Instância do Axios com configurações globais
  const api = axios.create({
    baseURL: baseUrl,
    timeout: timeout,
    validateStatus: () => true // Não lança erro automaticamente no status 4xx/5xx para podermos tratar
  });

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const res = await api.get(endpoint.path);
      const duration = Date.now() - start;
      
      // Define sucesso (2xx ou 3xx)
      const isSuccess = res.status >= 200 && res.status < 400;
      
      if (isSuccess) {
        console.log(`${colors.green}✅ [${res.status}] ${endpoint.path} (${duration}ms)${colors.reset}`);
        
        // Se for o endpoint de health, mostra detalhes extras do banco
        if (endpoint.path === '/health' && res.data) {
          const dbStatus = res.data.database === 'connected' ? colors.green : colors.red;
          console.log(`   └─ Database: ${dbStatus}${res.data.database}${colors.reset}`);
          console.log(`   └─ Uptime: ${Math.floor(res.data.uptime)}s`);
        }

      } else {
        // Falha (4xx ou 5xx)
        console.log(`${colors.red}❌ [${res.status}] ${endpoint.path} (${duration}ms)${colors.reset}`);
        if (endpoint.critical) hasErrors = true;
      }

    } catch (err) {
      // Erro de rede (Connection refused, timeout, etc)
      console.log(`${colors.red}❌ [ERRO] ${endpoint.path}: ${err.message}${colors.reset}`);
      if (endpoint.critical) hasErrors = true;
    }
  }

  console.log('\n---------------------------------------------------');
  
  if (hasErrors) {
    console.error(`${colors.red}💥 O Health Check FALHOU! Algumas rotas críticas não responderam.${colors.reset}`);
    process.exit(1); // Encerra com erro (importante para Docker/CI)
  } else {
    console.log(`${colors.green}✨ Sistema Operacional e Saudável!${colors.reset}`);
    process.exit(0); // Sucesso
  }
}

healthCheck();