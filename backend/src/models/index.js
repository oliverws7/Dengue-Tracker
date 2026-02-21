const { sequelize } = require('../config/database');
const User = require('./User');
const DengueFocus = require('./DengueFocus');
const PasswordReset = require('./passwordReset');

User.hasMany(DengueFocus, { foreignKey: 'userId', as: 'foci' });
DengueFocus.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PasswordReset, { foreignKey: 'userId' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  DengueFocus,
  PasswordReset
};