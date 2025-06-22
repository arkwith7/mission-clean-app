const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    booking_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    aircon_id: { type: DataTypes.INTEGER },
    booking_date: { type: DataTypes.DATEONLY, allowNull: false },
    booking_time: { type: DataTypes.TIME, allowNull: false },
    status: { type: DataTypes.ENUM('pending','confirmed','in_progress','completed','cancelled'), defaultValue: 'pending' },
    total_price: { type: DataTypes.DECIMAL(10,2) },
    discount_amount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    payment_status: { type: DataTypes.ENUM('pending','paid','refunded'), defaultValue: 'pending' },
    payment_method: { type: DataTypes.ENUM('cash','card','transfer','kakao_pay') },
    special_requests: { type: DataTypes.TEXT },
    technician_notes: { type: DataTypes.TEXT }
  }, {
    tableName: 'bookings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    Booking.belongsTo(models.Service, { foreignKey: 'service_id', as: 'service' });
    Booking.belongsTo(models.CustomerAircon, { foreignKey: 'aircon_id', as: 'customerAircon' });
    Booking.hasOne(models.ServiceRecord, { foreignKey: 'booking_id', as: 'serviceRecord' });
  };

  return Booking;
};
