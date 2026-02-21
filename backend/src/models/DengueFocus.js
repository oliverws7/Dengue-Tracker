const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class DengueFocus extends Model {
  static async getStatsByRisk() {
    return await this.findAll({
      attributes: [
        'riskLevel',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['riskLevel', 'status']
    });
  }

  async markAsResolved() {
    this.status = 'resolvido';
    return await this.save();
  }

  async updateRiskLevel(newRiskLevel) {
    this.riskLevel = newRiskLevel;
    return await this.save();
  }

  getDistance(lat, lng) {
    const R = 6371;
    const dLat = (lat - parseFloat(this.latitude)) * Math.PI / 180;
    const dLon = (lng - parseFloat(this.longitude)) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(parseFloat(this.latitude) * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

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
  photoUrl: DataTypes.STRING,
  address: DataTypes.STRING,
  riskLevel: {
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

const User = require('./User');
DengueFocus.belongsTo(User, { foreignKey: 'userId' });

module.exports = DengueFocus;