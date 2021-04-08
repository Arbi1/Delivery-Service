const Order = require('../../models/Order');
const User = require('../../models/User');
const asyncHandler = require('../../middleware/async');
const { Op } = require('sequelize');
const ErrorResponse = require('../../utils/errorResponse');
const Filiali = require('../../models/Filiali');
const { createInvoice } = require('../../utils/generateInvoice');
const shortId = require('shortid');
// @desc     Get all Orders
// @route    Get /api/v1/orders
// @access   Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  //TODO: Admin can view all orders
  const orders = await Order.findAll({
    where: { [Op.or]: [{ SenderId: req.user.id }, { AgentId: req.user.id }] },
  });

  res.status(200).json({ success: true, data: orders });
});

// @desc     Get one Order
// @route    Get /api/v1/order/:id
// @access   Private/Owner
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    where: {
      [Op.and]: [
        { id: req.params.id },
        { [Op.or]: [{ SenderId: req.user.id }, { AgentId: req.user.id }] },
      ],
    },
  });
  console.log(order);
  createInvoice(order, `./public/invoice/${shortId.generate()}.pdf`);

  if (!order) {
    return next(new ErrorResponse(`Order not found id: ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: order });
});

// @desc     Create a Order
// @route    Post /api/v1/order
// @access   Admin/
exports.createOrder = asyncHandler(async (req, res, next) => {
  //TODO: Make Sender create a shipment also
  let order = {};
  const t = await sequelize.transaction();
  try {
    if (req.user.role == 'SENDER') {
      let filiali = await Filiali.findByPk(req.user.FilialiId);
      //TODO: Sender can select also another filial
      order.FilialiId = req.user.FilialiId;
      order.accepted = false;
      order.SenderId = req.user.id;
      order.AgentId = filiali.OwnerId;
      order = await Order.create(order, { transaction: t });
    }
    if (req.user.role == 'AGENT' || req.user.role == 'ADMIN') {
      let filiali = await Filiali.findByPk(req.user.FilialiId, {
        transaction: t,
      });

      let sender = await User.findByPk(req.body.SenderId, { transaction: t });
      if (!sender) {
        return next(
          new ErrorResponse(
            `We are not able to find a sender with id: ${req.body.SenderId}`,
            404
          )
        );
      }
      order.FilialiId = req.user.FilialiId;
      order.accepted = true;
      order.SenderId = sender.id;
      order.AgentId = filiali.OwnerId;
      order = await Order.create(order, { transaction: t });
    }
    await t.commit();
  } catch (err) {
    console.log(err);
    await t.rollback();
    return next(
      new ErrorResponse(`Something went wrong during the transaction!`, 404)
    );
  }

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc     Update an Order
// @route    Put /api/v1/order
// @access   Admin/AgentId only
exports.updateOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findByPk(req.params.id);
  let user = await User.findByPk(req.user.id);

  if (!order) {
    return next(
      new ErrorResponse(
        `We were unable to find Order with id of ${req.params.id}`,
        404
      )
    );
  }
  if (!user || (user.id != order.AgentId && user.role != 'ADMIN')) {
    return next(
      new ErrorResponse(
        `You're not allow to access item with id ${req.params.id}`,
        404
      )
    );
  }

  order.accepted = req.body.accepted;
  await order.update();
  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc     Delete a Order
// @route    Delete /api/v1/admin/orders/:id
// @access   Private/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(
        `We were unable to find Order with id of ${req.params.id}`,
        404
      )
    );
  }

  await order.destroy();
  res.status(200).json({ success: true });
});
