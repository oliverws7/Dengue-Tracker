const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User extends Model {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  generateVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = token;
    this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return token;
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    field: 'verification_token'
  },
  verificationTokenExpires: {
    type: DataTypes.DATE,
    field: 'verification_token_expires'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  underscored: true,
  timestamps: true,

  // 🔒 Por padrão NÃO retorna CPF
  defaultScope: {
    attributes: { exclude: ['cpf'] }
  },

  // 🔓 Quando quiser incluir CPF
  scopes: {
    withCPF: {
      attributes: { include: ['cpf'] }
    }
  },

  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

module.exports = User;
