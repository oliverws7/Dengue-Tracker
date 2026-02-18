const { sequelize } = require('../config/database');
const User = require('./User');
const DengueFocus = require('./DengueFocus');
const PasswordReset = require('./passwordReset'); // Mantenha o nome conforme o arquivo físico

// Configuração de Associações (Relacionamentos)
// Um usuário tem muitos focos de dengue
User.hasMany(DengueFocus, { foreignKey: 'userId', as: 'foci' });
DengueFocus.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Um usuário pode ter solicitações de reset de senha
User.hasMany(PasswordReset, { foreignKey: 'userId' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  DengueFocus,
  PasswordReset
};