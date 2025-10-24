export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Listings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      listingId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },
      tokenId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      sellerAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'ETH',
      },
      status: {
        type: Sequelize.ENUM('active', 'sold', 'cancelled', 'expired'),
        defaultValue: 'active',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      images: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      features: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      condition: {
        type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor'),
        allowNull: true,
      },
      mileage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      soldAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      soldTo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      platformFee: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      netAmount: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      isEscrow: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      escrowDealId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      txHash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      blockchainStatus: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed'),
        defaultValue: 'pending',
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
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
    await queryInterface.addIndex('Listings', ['listingId'], {
      unique: true,
      name: 'listings_listing_id_unique',
    });

    await queryInterface.addIndex('Listings', ['tokenId'], {
      name: 'listings_token_id_idx',
    });

    await queryInterface.addIndex('Listings', ['sellerAddress'], {
      name: 'listings_seller_address_idx',
    });

    await queryInterface.addIndex('Listings', ['status'], {
      name: 'listings_status_idx',
    });

    await queryInterface.addIndex('Listings', ['price'], {
      name: 'listings_price_idx',
    });

    await queryInterface.addIndex('Listings', ['createdAt'], {
      name: 'listings_created_at_idx',
    });

    await queryInterface.addIndex('Listings', ['expiresAt'], {
      name: 'listings_expires_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Listings');
  },
};

