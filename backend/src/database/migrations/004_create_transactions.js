export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      txHash: {
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
      fromAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      toAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      gasUsed: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      gasPrice: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      tokenId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      listingId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      escrowDealId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      contractAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      methodName: {
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
      blockNumber: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      blockHash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      confirmationCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isGasless: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      relayerAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userSignature: {
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
      chainId: {
        type: Sequelize.INTEGER,
        defaultValue: 59140,
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdBy: {
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
    await queryInterface.addIndex('Transactions', ['txHash'], {
      unique: true,
      name: 'transactions_tx_hash_unique',
    });

    await queryInterface.addIndex('Transactions', ['type'], {
      name: 'transactions_type_idx',
    });

    await queryInterface.addIndex('Transactions', ['status'], {
      name: 'transactions_status_idx',
    });

    await queryInterface.addIndex('Transactions', ['fromAddress'], {
      name: 'transactions_from_address_idx',
    });

    await queryInterface.addIndex('Transactions', ['toAddress'], {
      name: 'transactions_to_address_idx',
    });

    await queryInterface.addIndex('Transactions', ['tokenId'], {
      name: 'transactions_token_id_idx',
    });

    await queryInterface.addIndex('Transactions', ['listingId'], {
      name: 'transactions_listing_id_idx',
    });

    await queryInterface.addIndex('Transactions', ['blockNumber'], {
      name: 'transactions_block_number_idx',
    });

    await queryInterface.addIndex('Transactions', ['createdAt'], {
      name: 'transactions_created_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  },
};
