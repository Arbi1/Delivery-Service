const { Sequelize, DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const Filiali = require('./Filiali');
const User = require('./User');
const { options } = require('./User');
const Shipment = require('./Shipment');

class Order extends Model {
  // you can enter methods here
  // Populate the data in Quantity, Price
}

Order.init(
  {
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: 'Quantity is not set' },
      },
    },
    // kto jan tarifa postes
    postFee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    //leket qe do mari mancja
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // Total paid shipments - post fee
    balance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    FilialiId: {
      type: DataTypes.INTEGER,
    },
    AgentId: {
      type: DataTypes.INTEGER,
    },
    SenderId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Order', // We need to choose the model name
  }
);

module.exports = Order;
