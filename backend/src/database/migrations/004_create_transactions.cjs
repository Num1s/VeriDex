module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tx_hash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM('mint', 'transfer', 'listing', 'purchase', 'escrow', 'verification', 'gasless'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
        defaultValue: 'pending',
      },
      from_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      to_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      gas_used: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      gas_price: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      token_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      listing_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      escrow_deal_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      contract_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      method_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      parameters: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      block_number: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      block_hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      confirmation_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_gasless: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      relayer_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_signature: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      nonce: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      network: {
        type: Sequelize.STRING,
        defaultValue: 'linea',
      },
      chain_id: {
        type: Sequelize.INTEGER,
        defaultValue: 59140,
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
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
    await queryInterface.addIndex('Transactions', ['tx_hash'], {
      unique: true,
      name: 'transactions_tx_hash_unique',
    });

    await queryInterface.addIndex('Transactions', ['type'], {
      name: 'transactions_type_idx',
    });

    await queryInterface.addIndex('Transactions', ['status'], {
      name: 'transactions_status_idx',
    });

    await queryInterface.addIndex('Transactions', ['from_address'], {
      name: 'transactions_from_address_idx',
    });

    await queryInterface.addIndex('Transactions', ['to_address'], {
      name: 'transactions_to_address_idx',
    });

    await queryInterface.addIndex('Transactions', ['token_id'], {
      name: 'transactions_token_id_idx',
    });

    await queryInterface.addIndex('Transactions', ['listing_id'], {
      name: 'transactions_listing_id_idx',
    });

    await queryInterface.addIndex('Transactions', ['block_number'], {
      name: 'transactions_block_number_idx',
    });

    await queryInterface.addIndex('Transactions', ['created_at'], {
      name: 'transactions_created_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  },
};

