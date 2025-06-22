const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    customer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING(100), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(100) },
    address: { type: DataTypes.TEXT, allowNull: false },
    detailed_address: { type: DataTypes.TEXT },
    age_group: { type: DataTypes.ENUM('20s','30s','40s','50s','60s+') },
    gender: { type: DataTypes.ENUM('male','female','other') },
    customer_type: { type: DataTypes.ENUM('individual','business'), defaultValue: 'individual' },
    registration_source: { type: DataTypes.ENUM('website','phone','referral','marketing'), defaultValue: 'website' },
    marketing_consent: { type: DataTypes.BOOLEAN, defaultValue: false },
    sms_consent: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Customer.associate = (models) => {
    Customer.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Customer.hasMany(models.Booking, { foreignKey: 'customer_id', as: 'bookings' });
    Customer.hasMany(models.CustomerAircon, { foreignKey: 'customer_id', as: 'aircons' });
  };

  return Customer;
};
