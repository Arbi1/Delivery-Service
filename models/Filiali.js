const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

class Filiali extends Model {}

Filiali.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Name is not allowed to be null' },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Address is not allowed to be null' },
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Name is not allowed to be null' },
      },
    },
    OwnerId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: 'Filiali',
  }
);

module.exports = Filiali;
