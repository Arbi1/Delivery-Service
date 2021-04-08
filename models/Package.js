const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const Filiali = require('./Filiali');

class Package extends Model {
  // you can enter methods here
}

Package.init(
  {
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dimensions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    //TODO: Has one filial
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Package', // We need to choose the model name
  }
);

// Create linking with Filial

module.exports = Package;
