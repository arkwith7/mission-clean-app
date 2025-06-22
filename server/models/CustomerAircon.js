const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerAircon = sequelize.define('CustomerAircon', {
    aircon_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    model_id: { type: DataTypes.INTEGER },
    installation_date: { type: DataTypes.DATEONLY },
    room_location: { type: DataTypes.STRING(50) },
    usage_frequency: { type: DataTypes.ENUM('daily','weekly','seasonal') },
    last_self_cleaning: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'customer_aircons', timestamps: false, underscored: true
  });

  CustomerAircon.associate = (models) => {
    CustomerAircon.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    CustomerAircon.belongsTo(models.AcModel, { foreignKey: 'model_id', as: 'model' });
  };

  return CustomerAircon;
};
