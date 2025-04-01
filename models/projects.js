/*************************************
 * Database Initialization & Models
 *************************************/

require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');

// Create the Sequelize instance using connection URL from .env
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false   // disable logging SQL queries to console
});

// Define the Sector model (for project categories/sectors)
const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false  // disable createdAt/updatedAt
});

// Define the Project model (the main resource)
const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  feature_img_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  summary_short: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  intro_short: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  impact: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  original_source_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Foreign key to Sector (will be added by association as 'sector_id')
  sector_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

// Set up associations: A Project belongs to a Sector, and a Sector has many Projects
Project.belongsTo(Sector, { foreignKey: 'sector_id' });
Sector.hasMany(Project, { foreignKey: 'sector_id' });

// Define the User model for authentication (email/password and role)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,   // store bcrypt-hashed passwords
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'      // 'user' or 'dataEntryClerk'
  }
}, {
  timestamps: false
});

/**
 * Initialize the database: sync all models.
 * Returns a Promise that resolves if sync is successful, or rejects on error.
 */
async function initialize() {
  // Sync models with the database (create tables if they don't exist)
  await sequelize.sync();
}

// Export the models and initialization function
module.exports = {
  sequelize,
  Op,
  Sector,
  Project,
  User,
  initialize
};
