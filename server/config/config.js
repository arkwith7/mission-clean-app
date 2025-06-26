const path = require('path');

module.exports = {
  development: {
    storage: path.join(__dirname, '../db/mission_clean.sqlite'),
    dialect: 'sqlite',
    logging: false,
  },
  test: {
    storage: ':memory:',
    dialect: 'sqlite',
    logging: false,
  },
  production: {
    storage: process.env.DATABASE_URL || '/app/db/mission_clean.sqlite',
    dialect: 'sqlite',
    logging: false,
  },
};
