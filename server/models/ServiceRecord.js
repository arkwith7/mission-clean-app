const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceRecord = sequelize.define('ServiceRecord', {
    record_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.INTEGER, allowNull: false },
    technician_name: { type: DataTypes.STRING(100) },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    work_summary: { type: DataTypes.TEXT },
    issues_found: { type: DataTypes.TEXT },
    recommendations: { type: DataTypes.TEXT },
    parts_replaced: { type: DataTypes.TEXT },
    next_service_date: { type: DataTypes.DATEONLY },
    customer_satisfaction: { type: DataTypes.INTEGER, validate: { min:1, max:5 } }
  }, {
    tableName: 'service_records',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ServiceRecord.associate = (models) => {
    ServiceRecord.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
  };

  return ServiceRecord;
};
