const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Service = sequelize.define('Service', {
    service_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    service_name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    base_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: false },
    service_type: { type: DataTypes.ENUM('basic','premium','maintenance'), allowNull: false },
    includes: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'services',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Service.associate = (models) => {
    Service.hasMany(models.Booking, { foreignKey: 'service_id', as: 'bookings' });
  };

  return Service;
};
