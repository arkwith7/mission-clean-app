const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AirconSpec = sequelize.define('AirconSpec', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    manufacturer: DataTypes.STRING,
    model_name: { type: DataTypes.STRING, unique: true },
    cooling_area_sqm: DataTypes.FLOAT,
    energy_grade: DataTypes.STRING,
    refrigerant_type: DataTypes.STRING,
    filter_type: DataTypes.STRING,
    is_inverter: DataTypes.BOOLEAN,
    manufacture_year: DataTypes.INTEGER,
    notes: DataTypes.TEXT
  }, {
    tableName: 'aircon_specs'
  });

  AirconSpec.associate = (models) => {
    AirconSpec.hasMany(models.Booking, { foreignKey: 'aircon_model_id', as: 'bookings' });
  };

  return AirconSpec;
};
