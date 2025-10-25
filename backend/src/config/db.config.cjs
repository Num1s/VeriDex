const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/database.cjs');

// Get development config
const config = dbConfig.development;
const isCLI = process.argv.some(arg => arg.includes('sequelize-cli') || arg.includes('sequelize'));

let sequelize;

if (isCLI) {
  // For Sequelize CLI, export the config directly
  module.exports = config;
} else {
  // Application configuration
  if (config.dialect === 'sqlite') {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: config.storage,
      logging: config.logging,
      define: {
        timestamps: true,
        underscored: false,
        paranoid: true,
      },
    });
  } else {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          underscored: false,
          paranoid: true,
        },
      }
    );
  }
}

// Test database connection and sync models
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized.');
  } catch (error) {
    console.error('❌ Database error:', error);
    console.log('⚠️ Continuing with mock data mode despite database error.');
    // Don't exit - allow server to start with mock data
  }
};

module.exports = { sequelize, testConnection };

