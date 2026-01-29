// src/utils/validateEnv.js
require('dotenv').config();

const validateEnv = () => {
  console.log('\n🔍 Verificando variáveis de ambiente...');

  const errors = [];
  const warnings = [];

  // 1. Variáveis Obrigatórias
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  requiredVars.forEach(key => {
    if (!process.env[key]) {
      errors.push(`❌ ${key} está faltando.`);
    }
  });

  // 2. Validação de Porta
  if (process.env.PORT) {
    const port = Number(process.env.PORT);
    if (isNaN(port) || port <= 0 || port >= 65536) {
      errors.push(`❌ PORT deve ser um número válido.`);
    }
  } else {
    process.env.PORT = '5000';
    warnings.push(`⚠️ PORT não definida. Usando padrão: 5000`);
  }

  // 3. Validação do MongoDB
  if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI;
    const isValidMongo = /^mongodb(\+srv)?:\/\/.+/.test(uri);
    
    if (!isValidMongo) {
      errors.push('❌ MONGODB_URI inválida.');
    }
  }

  // Relatório
  if (warnings.length > 0) warnings.forEach(w => console.log(w));

  if (errors.length > 0) {
    console.error('\n--- ERROS CRÍTICOS ---');
    errors.forEach(e => console.error(e));
    process.exit(1);
  }

  console.log('✅ Ambiente validado.\n');
};

module.exports = validateEnv;