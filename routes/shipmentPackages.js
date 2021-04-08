const express = require('express');
const {
  getPackageFromShipment,
  createPackageFromShipment,
  updatePackageFromShipment,
  deletePackageFromShipment,
} = require('../controllers/shipment');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/:shipmentId/package')
  .get(authorize('ADMIN', 'AGENT', 'SENDER'), getPackageFromShipment)
  .post(authorize('ADMIN', 'AGENT', 'SENDER'), createPackageFromShipment)
  .put(authorize('ADMIN', 'AGENT', 'SENDER'), updatePackageFromShipment)
  .delete(authorize('ADMIN', 'AGENT', 'SENDER'), deletePackageFromShipment);

module.exports = router;
