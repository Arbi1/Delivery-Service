const Shipment = require('../../models/Shipment');
const Order = require('../../models/Order');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const { sequelize } = require('../../models/User');
const axios = require('axios');

// @desc     Get all shipment from orders
// @route    Get /api/v1/order/:orderId/shipment
// @access   Admin Only
exports.getAllShipmentFromOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`)
    );
  }

  const shipment = await Shipment.findAll({
    where: { OrderId: req.params.orderId },
  });

  res.status(201).json({
    success: true,
    data: shipment,
  });
});

// @desc     Get single shipment from order
// @route    Get /api/v1/order/:orderId/shipment/:shipmentId
// @access   Admin Only
exports.getShipmentFromOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`)
    );
  }

  const shipment = await Shipment.findByPk(req.params.shipmentId);

  res.status(201).json({
    success: true,
    data: shipment,
  });
});

// @desc     Create shipment
// @route    Post /api/v1/order/:orderId/shipment
// @access   Admin Only
exports.createShipmentInOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`)
    );
  }
  //TODO: Remove te completed date, model update needed.
  const { productPrice, PackageId, ReceiverId, completedDate } = req.body;

  let shipment = {
    productPrice,
    PackageId,
    ReceiverId,
    completedDate,
    OrderId: req.params.orderId,
    SenderId: req.user.id,
  };
  shipment = await Shipment.create(shipment);

  res.status(201).json({
    success: true,
    data: shipment,
  });
});

// @desc     Update shipment
// @route    Post /api/v1/order/:orderId/shipment/:id
// @access   Admin Only
exports.updateShipmentInOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`)
    );
  }
  let shipment = await Shipment.findByPk(req.params.shipmentId);
  console.log(shipment);
  if (!shipment || shipment.OrderId != req.params.orderId) {
    return next(
      new ErrorResponse(`Shipment not found in order: ${req.params.orderId}`)
    );
  }

  if (req.user.role == 'SENDER') {
    if (shipment.completedDate != null || shipment.accepted != false) {
      return next(
        new ErrorResponse(
          `Sender is not allowed to update anymore: ${req.params.orderId}`
        )
      );
    }
    // Do besh update

    const t = await sequelize.transaction();

    try {
      const { productPrice, ReceiverId } = req.body;
      shipment.productPrice = productPrice;
      shipment.ReceiverId = ReceiverId;
      console.log(shipment);

      shipment = await shipment.save({ transaction: t });
      console.log(shipment);
      order.accepted = false;
      order.save();
      t.commit();
    } catch (err) {
      console.log(err);
      t.rollback();
    }
  }

  if (req.user.role == 'AGENT' || 'ADMIN') {
    const t = await sequelize.transaction();

    try {
      shipment = await shipment.update({ ...req.body }, { transaction: t });

      order.accepted = true;
      order.save();
      t.commit();
    } catch (err) {
      t.rollback();
    }
  }

  if (req.user.role == 'POSTMAN') {
    if (shipment.completedDate != null || accepted != false) {
      return next(
        new ErrorResponse(`Shipment no t found in order: ${req.params.orderId}`)
      );
    }
    // Do besh update

    const t = await sequelize.transaction();

    try {
      const { accepted } = req.body;

      shipment = await shipment.update({ accepted }, { transaction: t });

      order.accepted = true;
      order.save();
      t.commit();
    } catch (err) {
      t.rollback();
    }
  }
  res.status(201).json({
    success: true,
    data: shipment,
  });
});

// @desc     Delete shipment from order
// @route    Delete /api/v1/order/:orderId/shipment/:shipmentId
// @access   Admin Only
exports.deleteShipmentInOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`)
    );
  }
  const shipment = await Shipment.findByPk(req.params.shipmentId);
  if (!shipment || shipment.OrderId != req.params.orderId) {
    return next(
      new ErrorResponse(`Shipment not found in order: ${req.params.orderId}`)
    );
  }

  // check if it is accepted but not completed- receiver hasn't given the payment
  if (shipment.accepted) {
    return next(
      new ErrorResponse(`You cannot delete shipment because it's on the way!!`)
    );
  }

  //Delete the shipment
  await shipment.destroy();

  res.status(201).json({
    success: true,
    data: shipment,
  });
});
