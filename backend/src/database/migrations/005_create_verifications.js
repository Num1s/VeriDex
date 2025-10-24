export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Verifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      requestId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },
      tokenId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      requesterAddress: {
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
      verificationNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verificationDocuments: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      verificationFee: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      verifierAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
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
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      additionalInfo: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal',
      },
      assignedTo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      estimatedValue: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      riskScore: {
        type: Sequelize.DECIMAL(3, 2),
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
    await queryInterface.addIndex('Verifications', ['requestId'], {
      unique: true,
      name: 'verifications_request_id_unique',
    });

    await queryInterface.addIndex('Verifications', ['tokenId'], {
      name: 'verifications_token_id_idx',
    });

    await queryInterface.addIndex('Verifications', ['status'], {
      name: 'verifications_status_idx',
    });

    await queryInterface.addIndex('Verifications', ['requesterAddress'], {
      name: 'verifications_requester_address_idx',
    });

    await queryInterface.addIndex('Verifications', ['verifierAddress'], {
      name: 'verifications_verifier_address_idx',
    });

    await queryInterface.addIndex('Verifications', ['verifiedAt'], {
      name: 'verifications_verified_at_idx',
    });

    await queryInterface.addIndex('Verifications', ['expiresAt'], {
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
