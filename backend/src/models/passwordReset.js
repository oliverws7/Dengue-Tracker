const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class PasswordReset extends Model {

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
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'Users',
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
  underscored: true
});

module.exports = PasswordReset;