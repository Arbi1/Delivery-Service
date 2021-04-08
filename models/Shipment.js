const { Sequelize, DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const Order = require('./Order');
const asyncHandler = require('../middleware/async');

class Shipment extends Model {
  // you can enter methods here
}

Shipment.init(
  {
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notNull: { msg: 'Item not accepted!' },
      },
    },
    postFee: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 300,
    },
    productPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PackageId: {
      type: DataTypes.INTEGER,
    },
    OrderId: {
      type: DataTypes.INTEGER,
    },
    ReceiverId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Shipment', // We need to choose the model name
  }
);

// Create linking with Filial
//beforeDelete edhe afterSave
Shipment.afterSave(
  asyncHandler(async (shipment, options) => {
    try {
      const Order = require('./Order');
      let order = await Order.findOne({ id: shipment.OrderId });
      let price = await Shipment.sum('productPrice', {
        where: { OrderId: order.id },
      });
      let quantity = await Shipment.count('id', {
        where: { OrderId: order.id },
      });
      let postFee = await Shipment.sum('postFee', {
        where: { OrderId: order.id },
      });
      let balance = await Shipment.sum('productPrice', {
        where: {
          [Op.and]: [
            { OrderId: order.id },
            { completedDate: null },
            { accepted: true },
          ],
        },
      });
      if (isNaN(balance)) {
        balance = 0;
      }
      order.quantity = quantity;
      if (order.quantity < 0) {
        order.quantity = 0;
      }
      order.postFee = postFee;
      order.price = price;
      order.balance = balance - postFee;
      console.log(order);
      await order.save();
      return;
    } catch (err) {
      console.log('something happen on the hook added on Shipment');
      console.log(err);
    }
  })
);

Shipment.beforeDestroy(async (shipment, options) => {
  const Order = require('./Order');

  let order = await Order.findByPk(shipment.OrderId);

  order.postFee -= shipment.postFee;
  if (isNaN(order.postFee)) {
    order.postFee = 0;
  }
  order.price -= shipment.price;
  if (isNaN(order.price)) {
    order.price = 0;
  }
  order.balance += shipment.postFee;
  if (isNaN(order.balance)) {
    order.balance = 0;
  }
  order.quantity -= 1;
  if (order.quantity < 0) {
    order.quantity = 0;
  }
  await order.save();
});

module.exports = Shipment;
