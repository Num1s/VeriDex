require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || ':memory:',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: process.env.DB_DIALECT || 'sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
    },
  },
};

if (config.development.dialect === 'sqlite') {
  config.development.storage = config.development.database;
  delete config.development.username;
  delete config.development.password;
  delete config.development.host;
  delete config.development.port;
}

module.exports = config;

