module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cars', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      token_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        unique: true,
      },
      owner_address: {
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
      engine_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transmission: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fuel_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata_uri: {
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
      verification_status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      verification_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verified_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_listed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      listing_price: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
      },
      listing_id: {
        type: Sequelize.BIGINT,
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
    await queryInterface.addIndex('Cars', ['token_id'], {
      unique: true,
      name: 'cars_token_id_unique',
    });

    await queryInterface.addIndex('Cars', ['vin'], {
      unique: true,
      name: 'cars_vin_unique',
    });

    await queryInterface.addIndex('Cars', ['owner_address'], {
      name: 'cars_owner_address_idx',
    });

    await queryInterface.addIndex('Cars', ['verification_status'], {
      name: 'cars_verification_status_idx',
    });

    await queryInterface.addIndex('Cars', ['is_listed'], {
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

