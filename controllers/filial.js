const Filiali = require('../models/Filiali');
const { compareSync } = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc     Get all Filal
// @route    Get /api/v1/admin/filialis
// @access   Private/Admin
exports.getAllFilialis = asyncHandler(async (req, res, next) => {
  const filialis = await Filiali.findAll();

  res.status(200).json({ success: true, data: filialis });
});

// @desc     Get one Filal
// @route    Get /api/v1/admin/filialis/:id
// @access   Private/Admin
exports.getFilial = asyncHandler(async (req, res, next) => {
  const filialis = await Filiali.findByPk(req.params.id);
  res.status(200).json({ success: true, data: filialis });
});

// @desc     Create a filail
// @route    Post /api/v1/admin/filals
// @access   Admin Only
exports.createFilial = asyncHandler(async (req, res, next) => {
  const { name, address, phone, OwnerId } = req.body;
  const user = await User.findByPk(OwnerId);

  if (!user || !['AGENT', 'ADMIN'].includes(user.role)) {
    return next(
      new ErrorResponse(
        `Something went wrong assigning a filial to user with id of:  ${req.body.OwnerId}`,
        404
      )
    );
  }
  const filiali = await Filiali.create({
    name,
    address,
    phone,
    OwnerId,
  });

  res.status(201).json({
    success: true,
    data: filiali,
  });
});

// @desc     Update a filail
// @route    Put /api/v1/admin/filialis
// @access   Admin/OwnerId only
exports.updateFilial = asyncHandler(async (req, res, next) => {
  let fialiali = await Filiali.findByPk(req.params.id);
  let user = await User.findByPk(req.user.id);
  if (!user || (user.id != fialiali.OwnerId && user.role != 'ADMIN')) {
    return next(
      new ErrorResponse(
        `You're not allow to access item with id ${req.params.id}`,
        404
      )
    );
  }

  if (!fialiali) {
    return next(
      new ErrorResponse(
        `We were unable to find Filiali with id of ${req.params.id}`,
        404
      )
    );
  }

  const newUpdated = await fialiali.update(req.body);

  res.status(201).json({
    success: true,
    data: newUpdated,
  });
});

// @desc     Delete a Filal
// @route    Delete /api/v1/admin/filialis/:id
// @access   Private/Admin
exports.deleteFilial = asyncHandler(async (req, res, next) => {
  const filialis = await Filiali.findByPk(req.params.id);

  if (!filialis) {
    return next(
      new ErrorResponse(
        `We were unable to find Filiali with id of ${req.params.id}`,
        404
      )
    );
  }

  await filialis.destroy();
  res.status(200).json({ success: true });
});
