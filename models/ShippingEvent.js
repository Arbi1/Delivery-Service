const { Sequelize, DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const asyncHandler = require('../middleware/async');
const Shipment = require('./Shipment');

class ShippingEvent extends Model {
  // you can enter methods here
}

ShippingEvent.init(
  {
    eventType: {
        type: DataTypes.ENUM('ACCEPTED', 'ON THE WAY', 'DELIVERED'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Please specify an event type!' },
        },
    },
    ShipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'ShipmentEvent', // We need to choose the model name
  }
);

ShippingEvent.beforeSave(
    asyncHandler(async (shippingEvent, options) => {
    try {
        if(shippingEvent.eventType== 'DELIEVERED'){
            const shipment = await Shipment.findByPk(shippingEvent.ShipmentId);
            shipment.accepted = true;
            await shipment.save();
        }
    } catch (err) {
      console.log('something happen on the hook added on ShippingEvent');
      console.log(err);
    }
  }));

module.exports = ShippingEvent;
