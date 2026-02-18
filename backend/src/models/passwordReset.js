const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class PasswordReset extends Model {
  // Helper para verificar se o token ainda é válido
  isValid() {
    return !this.used && new Date() < this.expiresAt;
  }
}

PasswordReset.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER, // Deve ser INTEGER para bater com o User.id
    allowNull: false,
    field: 'user_id', // Garante o padrão snake_case no banco
    references: {
      model: 'Users', // Nome exato da tabela definido no User.js
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'PasswordReset',
  tableName: 'password_resets',
  timestamps: true,
  underscored: true // Garante created_at e updated_at
});

module.exports = PasswordReset;