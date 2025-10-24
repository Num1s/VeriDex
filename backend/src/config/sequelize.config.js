import config from './index.js';

export default {
  development: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
  },
  test: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name + '_test',
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: false,
  },
  production: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: false,
  },
};

