const app = require('./app');
const connectDB = require('./config/database'); 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB(); // conecta ao MongoDB

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const mongoose = require('mongoose');

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
