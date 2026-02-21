const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL conectado com sucesso!');

  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };