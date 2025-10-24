module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Listings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      listing_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },
      token_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      seller_address: {
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
  expires_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  sold_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  sold_to: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  platform_fee: {
    type: Sequelize.DECIMAL(36, 18),
    allowNull: true,
  },
  net_amount: {
    type: Sequelize.DECIMAL(36, 18),
    allowNull: true,
  },
  is_escrow: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  escrow_deal_id: {
    type: Sequelize.BIGINT,
    allowNull: true,
  },
      tx_hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      blockchain_status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed'),
        defaultValue: 'pending',
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
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
    await queryInterface.addIndex('Listings', ['listing_id'], {
      unique: true,
      name: 'listings_listing_id_unique',
    });

    await queryInterface.addIndex('Listings', ['token_id'], {
      name: 'listings_token_id_idx',
    });

    await queryInterface.addIndex('Listings', ['seller_address'], {
      name: 'listings_seller_address_idx',
    });

    await queryInterface.addIndex('Listings', ['status'], {
      name: 'listings_status_idx',
    });

    await queryInterface.addIndex('Listings', ['price'], {
      name: 'listings_price_idx',
    });

    await queryInterface.addIndex('Listings', ['created_at'], {
      name: 'listings_created_at_idx',
    });

    await queryInterface.addIndex('Listings', ['expires_at'], {
      name: 'listings_expires_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Listings');
  },
};

