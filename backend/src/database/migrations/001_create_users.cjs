module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      wallet_address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profile_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kyc_status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'not_submitted'),
        defaultValue: 'not_submitted',
      },
      kyc_documents: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      nonce: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_cars: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_listings: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_purchases: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reputation_score: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 5.00,
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      blocked_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      preferences: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create indexes
    await queryInterface.addIndex('Users', ['wallet_address'], {
      unique: true,
      name: 'users_wallet_address_unique',
    });

    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique',
    });

    await queryInterface.addIndex('Users', ['kyc_status'], {
      name: 'users_kyc_status_idx',
    });

    await queryInterface.addIndex('Users', ['is_verified'], {
      name: 'users_verified_idx',
    });

    await queryInterface.addIndex('Users', ['is_blocked'], {
      name: 'users_blocked_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};

