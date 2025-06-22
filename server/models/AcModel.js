const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AcModel = sequelize.define('AcModel', {
    model_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_id: { type: DataTypes.INTEGER, allowNull: false },
    model_name: { type: DataTypes.STRING(100), allowNull: false },
    model_code: { type: DataTypes.STRING(50) },
    type: { type: DataTypes.ENUM('wall','stand','ceiling','window','portable'), allowNull: false },
    cooling_capacity: { type: DataTypes.DECIMAL(5,2) },
    energy_rating: { type: DataTypes.ENUM('1','2','3','4','5') },
    refrigerant_type: { type: DataTypes.STRING(20) },
    filter_type: { type: DataTypes.STRING(100) },
    inverter_type: { type: DataTypes.ENUM('inverter','fixed'), defaultValue: 'inverter' },
    release_year: { type: DataTypes.INTEGER },
    manual_url: { type: DataTypes.STRING(255) },
    image_url: { type: DataTypes.STRING(255) },
    cleaning_notes: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'ac_models', timestamps: false, underscored: true
  });

  AcModel.associate = (models) => {
    AcModel.belongsTo(models.AcBrand, { foreignKey: 'brand_id', as: 'brand' });
    AcModel.hasMany(models.CustomerAircon, { foreignKey: 'model_id', as: 'customerAircons' });
  };

  return AcModel;
};
