const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV'
];

function validateEnv() {
  console.log('🔍 Validando variáveis de ambiente...');
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente ausentes:', missing);
    console.error('💡 Configure seu arquivo .env com base em .env.example');
    process.exit(1);
  }
  
  if (process.env.JWT_SECRET === 'sua_chave_secreta_aqui' || 
      process.env.JWT_SECRET.includes('exemplo')) {
    console.warn('⚠️  JWT_SECRET está com valor padrão! Altere para produção.');
  }
  
  if (process.env.NODE_ENV === 'production' && 
      process.env.MONGODB_URI.includes('localhost')) {
    console.warn('⚠️  Usando MongoDB local em produção! Configure MongoDB Atlas.');
  }
  
  console.log('✅ Variáveis de ambiente validadas com sucesso!');
  return true;
}

if (require.main === module) {
  validateEnv();
}

module.exports = validateEnv;