module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    service_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '서비스명'
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '서비스 유형 (일반, 시스템, 실외기 등)'
    },
    base_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '기본 가격'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '서비스 설명'
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      comment: '예상 소요 시간 (분)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '서비스 활성화 여부'
    }
  }, {
    tableName: 'services',
    timestamps: true,
    comment: '서비스 정보 테이블'
  });

  Service.associate = (models) => {
    Service.hasMany(models.Booking, { 
      foreignKey: 'service_id', 
      as: 'bookings' 
    });
  };

  return Service;
};
