module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Verifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },
      token_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      requester_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'expired'),
        defaultValue: 'pending',
      },
      vin: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      make: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      documents: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      verification_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verification_documents: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      verification_fee: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      verifier_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
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
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      additional_info: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal',
      },
      assigned_to: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      estimated_value: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      risk_score: {
        type: Sequelize.DECIMAL(3, 2),
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
    await queryInterface.addIndex('Verifications', ['request_id'], {
      unique: true,
      name: 'verifications_request_id_unique',
    });

    await queryInterface.addIndex('Verifications', ['token_id'], {
      name: 'verifications_token_id_idx',
    });

    await queryInterface.addIndex('Verifications', ['status'], {
      name: 'verifications_status_idx',
    });

    await queryInterface.addIndex('Verifications', ['requester_address'], {
      name: 'verifications_requester_address_idx',
    });

    await queryInterface.addIndex('Verifications', ['verifier_address'], {
      name: 'verifications_verifier_address_idx',
    });

    await queryInterface.addIndex('Verifications', ['verified_at'], {
      name: 'verifications_verified_at_idx',
    });

    await queryInterface.addIndex('Verifications', ['expires_at'], {
      name: 'verifications_expires_at_idx',
    });

    await queryInterface.addIndex('Verifications', ['priority'], {
      name: 'verifications_priority_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Verifications');
  },
};

