const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];

// DB 디렉토리 존재 확인 및 생성
if (config.dialect === 'sqlite') {
  const dbDir = path.dirname(config.storage);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Ensure User table sync
// User model will be loaded from User.js
db.sequelize = sequelize;

if (process.env.NODE_ENV === 'development') {
  sequelize.sync();
}

module.exports = db;
