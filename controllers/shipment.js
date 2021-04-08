const Package = require('../models/Package');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const { compareSync } = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { raw } = require('express');
const { sequelize } = require('../models/User');

// @desc     Get Package for given shipment
// @route    Get /api/v1/shipment/:shipmentId/package/
// @access   Private
exports.getPackageFromShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findByPk(req.params.shipmentId);
  if (!shipment) {
    return next(
      new ErrorResponse(
        `Shipment not found with id of ${req.params.shipmentId}`
      )
    );
  }

  const package = await Package.findByPk(shipment.PackageId);

  if (!package) {
    return next(
      new ErrorResponse(`Something went wrong fetching the shipment's package`)
    );
  }

  res.status(200).json({ success: true, data: package });
});

// @desc     Create a package
// @route    POST /api/v1/shipment/:shipmentId/package
// @access   Private
exports.createPackageFromShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findByPk(req.params.shipmentId);
  if (!shipment) {
    return next(
      new ErrorResponse(
        `Shipment not found with id of ${req.params.shipmentId}`
      )
    );
  }

  let package = req.body;

  package = await Package.create(package);

  shipment.PackageId = package.id;
  await shipment.save();
  shipment.package = package;
  res.status(200).json({ success: true, data: shipment });
});

// @desc     Update a package
// @route    Put /api/v1/shipment/:shipmentId/package
// @access   Private
exports.updatePackageFromShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findByPk(req.params.shipmentId);
  if (!shipment) {
    return next(
      new ErrorResponse(
        `Shipment not found with id of ${req.params.shipmentId}`
      )
    );
  }

  const package = await Package.findByPk(shipment.PackageId);

  if (!package) {
    return next(
      new ErrorResponse(`Something went wrong fetching the shipment's package`)
    );
  }
  await package.update(req.body);

  res.status(200).json({ success: true, data: shipment });
});

// @desc     Delete a package
// @route    Delete /api/v1/shipment/:shipmentId/package
// @access   Admin Only
exports.deletePackageFromShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findByPk(req.params.shipmentId);
  if (!shipment) {
    return next(
      new ErrorResponse(`Shipment not found with id of ${req.params.id}`)
    );
  }
  const user = await User.findByPk(req.user.id);
  if (!user || !['AGENT', 'ADMIN'].includes(user.role)) {
    return next(new ErrorResponse(`Something went wrong!`, 404));
  }

  const package = await Package.findByPk(shipment.PackageId);

  await package.destroy();

  res.status(201).json({
    success: true,
    data: shipment,
  });
});
