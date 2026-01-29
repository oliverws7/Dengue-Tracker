// Tenta carregar o .env caso ainda não tenha sido carregado
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

  // 2. Validação de Porta (Se existir, tem que ser número)
  if (process.env.PORT) {
    const port = Number(process.env.PORT);
    if (isNaN(port) || port <= 0 || port >= 65536) {
      errors.push(`❌ PORT deve ser um número válido (recebido: ${process.env.PORT}).`);
    }
  } else {
    // Define padrão se não existir (opcional, mas recomendado)
    process.env.PORT = '5000';
    warnings.push(`⚠️ PORT não definida. Usando padrão: 5000`);
  }

  // 3. Validação do MongoDB (Aceita Local e Atlas)
  if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI;
    const isValidMongo = /^mongodb(\+srv)?:\/\/.+/.test(uri);
    
    if (!isValidMongo) {
      errors.push('❌ MONGODB_URI não parece ser uma string de conexão válida.');
    } else if (!uri.includes('localhost') && !uri.includes('127.0.0.1') && !uri.includes('+srv')) {
      warnings.push('⚠️ Você está usando uma conexão remota sem "+srv". Verifique se é intencional.');
    }
  }

  // 4. Validação de Segurança Básica
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 8) {
    warnings.push('⚠️ JWT_SECRET é muito curto (menos de 8 caracteres). Isso é inseguro.');
  }

  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    warnings.push(`⚠️ NODE_ENV está definido como "${process.env.NODE_ENV}". O ideal é "development" ou "production".`);
  }

  // === RELATÓRIO FINAL ===

  // Mostrar Avisos
  if (warnings.length > 0) {
    console.log('\n--- Avisos (Não bloqueantes) ---');
    warnings.forEach(w => console.log(w));
  }

  // Mostrar Erros e Parar
  if (errors.length > 0) {
    console.error('\n--- ERROS CRÍTICOS (A aplicação não pode iniciar) ---');
    errors.forEach(e => console.error(e));
    console.error('\n🚫 Corrija o arquivo .env e tente novamente.\n');
    process.exit(1);
  }

  console.log('✅ Ambiente validado com sucesso.\n');
  return true;
};

module.exports = validateEnv;