const Receiver = require('../models/Receiver');
const { compareSync } = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');

// @desc     Get all Receivers
// @route    Get /api/v1/receivers
// @access   Private/Admin
exports.getReceivers = asyncHandler(async (req, res, next) => {
  const filialis = await Receiver.findAll({ where: { OwnerId: req.user.id } });

  res.status(200).json({ success: true, data: filialis });
});

// @desc     Get one Receiver
// @route    Get /api/v1/receiver/:id
// @access   Private/Owner
exports.getReceiver = asyncHandler(async (req, res, next) => {
  const receiver = await Receiver.findOne({
    where: {
      [Op.and]: [{ id: req.params.id }, { OwnerId: req.user.id }],
    },
  });

  if (!receiver) {
    return next(
      new ErrorResponse(`Receiver not found id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: receiver });
});

// @desc     Create a Receiver
// @route    Post /api/v1/receiver
// @access   Admin/Sender Only
exports.createReceiver = asyncHandler(async (req, res, next) => {
  let receiver = { ...req.body, OwnerId: req.user.id };
  console.log(receiver);

  let user = await User.findByPk(req.user.id);

  // receiver = await Receiver.create(receiver);

  receiver = await Receiver.create(receiver);

  console.log(receiver);
  res.status(201).json({
    success: true,
    data: receiver,
  });
});

// @desc     Update a Receiver
// @route    Put /api/v1/receiver
// @access   Admin/OwnerId only
exports.updateReceiver = asyncHandler(async (req, res, next) => {
  let receiver = await Receiver.findByPk(req.params.id);
  let user = await User.findByPk(req.user.id);
  if (!user || (user.id != receiver.OwnerId && user.role != 'ADMIN')) {
    return next(
      new ErrorResponse(
        `You're not allow to access item with id ${req.params.id}`,
        404
      )
    );
  }

  if (!receiver) {
    return next(
      new ErrorResponse(
        `We were unable to find Receiver with id of ${req.params.id}`,
        404
      )
    );
  }

  const newUpdated = await receiver.update(req.body);

  res.status(201).json({
    success: true,
    data: newUpdated,
  });
});

// @desc     Delete a Receiver
// @route    Delete /api/v1/admin/receivers/:id
// @access   Private/Admin
exports.deleteReceiver = asyncHandler(async (req, res, next) => {
  const receiver = await Receiver.findByPk(req.params.id);
  const user = await User.findByPk(req.user.id);

  if (!receiver) {
    return next(
      new ErrorResponse(
        `We were unable to find Receiver with id of ${req.params.id}`,
        404
      )
    );
  }
  if (req.user.id != receiver.OwnerId && user.role != 'ADMIN') {
    return next(
      new ErrorResponse(
        `You're not allow to access item with id ${req.params.id}`,
        404
      )
    );
  }

  await receiver.destroy();
  res.status(200).json({ success: true });
});
