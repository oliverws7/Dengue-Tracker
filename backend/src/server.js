require('dotenv').config({ path: './.env' });

const app = require('./app');
const { connectDB, sequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {

    await connectDB();

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

const gracefulShutdown = async () => {
  try {
    console.log('\nEncerrando conexão com o banco de dados...');
    await sequelize.close();
    console.log('Conexão com PostgreSQL fechada.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao fechar conexão:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);