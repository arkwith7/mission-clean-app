const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MediaFile = sequelize.define('MediaFile', {
    file_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING(255), allowNull: false },
    original_filename: { type: DataTypes.STRING(255) },
    file_path: { type: DataTypes.STRING(500), allowNull: false },
    file_type: { type: DataTypes.ENUM('image','video','document'), allowNull: false },
    file_size: { type: DataTypes.INTEGER },
    mime_type: { type: DataTypes.STRING(100) },
    uploaded_by: { type: DataTypes.INTEGER },
    upload_purpose: { type: DataTypes.ENUM('gallery','catalog','manual','profile','marketing') },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'media_files',
    timestamps: false,
    underscored: true
  });

  MediaFile.associate = (models) => {
    MediaFile.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'uploader' });
    MediaFile.hasMany(models.WorkGallery, { foreignKey: 'before_image_id', as: 'workBeforeImages' });
    MediaFile.hasMany(models.WorkGallery, { foreignKey: 'after_image_id', as: 'workAfterImages' });
    MediaFile.hasMany(models.WorkGallery, { foreignKey: 'work_video_id', as: 'workVideos' });
  };

  return MediaFile;
};
