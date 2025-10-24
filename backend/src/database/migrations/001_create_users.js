export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      walletAddress: {
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
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kycStatus: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'not_submitted'),
        defaultValue: 'not_submitted',
      },
      kycDocuments: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      nonce: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      totalCars: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalListings: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalPurchases: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reputationScore: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 5.00,
      },
      isBlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      blockedReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      preferences: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create indexes
    await queryInterface.addIndex('Users', ['walletAddress'], {
      unique: true,
      name: 'users_wallet_address_unique',
    });

    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique',
    });

    await queryInterface.addIndex('Users', ['kycStatus'], {
      name: 'users_kyc_status_idx',
    });

    await queryInterface.addIndex('Users', ['isVerified'], {
      name: 'users_verified_idx',
    });

    await queryInterface.addIndex('Users', ['isBlocked'], {
      name: 'users_blocked_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
