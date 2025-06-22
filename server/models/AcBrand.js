const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AcBrand = sequelize.define('AcBrand', {
    brand_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_name: { type: DataTypes.STRING(50), allowNull: false },
    brand_name_en: { type: DataTypes.STRING(50) },
    logo_url: { type: DataTypes.STRING(255) },
    website_url: { type: DataTypes.STRING(255) },
    support_phone: { type: DataTypes.STRING(20) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'ac_brands', timestamps: false, underscored: true
  });

  AcBrand.associate = (models) => {
    AcBrand.hasMany(models.AcModel, { foreignKey: 'brand_id', as: 'models' });
  };

  return AcBrand;
};
