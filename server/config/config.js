const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../mission_clean.sqlite'),
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../mission_clean_test.sqlite'),
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../mission_clean.sqlite'),
    logging: false
  }
};
