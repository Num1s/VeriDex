export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cars', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tokenId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        unique: true,
      },
      ownerAddress: {
        type: Sequelize.STRING,
        allowNull: false,
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
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mileage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      engineType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transmission: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fuelType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadataURI: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      images: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      documents: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      verificationNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verifiedBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isListed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      listingPrice: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      listingId: {
        type: Sequelize.BIGINT,
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
    await queryInterface.addIndex('Cars', ['tokenId'], {
      unique: true,
      name: 'cars_token_id_unique',
    });

    await queryInterface.addIndex('Cars', ['vin'], {
      unique: true,
      name: 'cars_vin_unique',
    });

    await queryInterface.addIndex('Cars', ['ownerAddress'], {
      name: 'cars_owner_address_idx',
    });

    await queryInterface.addIndex('Cars', ['verificationStatus'], {
      name: 'cars_verification_status_idx',
    });

    await queryInterface.addIndex('Cars', ['isListed'], {
      name: 'cars_listed_idx',
    });

    await queryInterface.addIndex('Cars', ['make', 'model'], {
      name: 'cars_make_model_idx',
    });

    await queryInterface.addIndex('Cars', ['year'], {
      name: 'cars_year_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Cars');
  },
};
