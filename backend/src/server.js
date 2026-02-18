require('dotenv').config({ path: './.env' });

const app = require('./app');
const { connectDB, sequelize } = require('./config/database'); // Importa a conexão e a instância do sequelize

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Conecta ao PostgreSQL
    await connectDB();

    // 2. Sincroniza os modelos com o banco de dados
    // O alter: true atualiza as tabelas se houver mudanças nos modelos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com o PostgreSQL.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown - Encerramento limpo da conexão
const gracefulShutdown = async () => {
  try {
    console.log('\nEncerrando conexão com o banco de dados...');
    await sequelize.close(); // Fecha a conexão do Sequelize
    console.log('Conexão com PostgreSQL fechada.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao fechar conexão:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);