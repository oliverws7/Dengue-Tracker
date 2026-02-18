const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class DengueFocus extends Model {}

DengueFocus.init({
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [10, 500] }
  },
  photo_url: DataTypes.STRING,
  address: DataTypes.STRING,
  risk_level: {
    type: DataTypes.ENUM('baixo_risco', 'medio_risco', 'alto_risco'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('monitorando', 'resolvido'),
    defaultValue: 'monitorando'
  }
}, {
  sequelize,
  modelName: 'DengueFocus'
});

// Relacionamento (Equivalente ao ref: 'User' do Mongoose)
const User = require('./User');
DengueFocus.belongsTo(User, { foreignKey: 'user_id' });

module.exports = DengueFocus;