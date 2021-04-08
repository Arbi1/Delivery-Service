const express = require('express');
const {
  getOrder,
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/order/order');

const {
  getAllShipmentFromOrder,
  getShipmentFromOrder,
  createShipmentInOrder,
  updateShipmentInOrder,
  deleteShipmentInOrder,
} = require('../controllers/order/orderShipments');

const router = express.Router();
const { protect, authorize, passportProtect } = require('../middleware/auth');

router.use(passportProtect);
router.use(protect);

router
  .route('/')
  .get(authorize('ADMIN', 'AGENT', 'SENDER'), getOrders)
  .post(authorize('ADMIN', 'AGENT', 'SENDER'), createOrder);

router
  .route('/:id')
  .put(authorize('ADMIN', 'AGENT'), updateOrder)
  .get(authorize('ADMIN', 'AGENT', 'SENDER'), getOrder)
  .delete(authorize('ADMIN'), deleteOrder);

router
  .route('/:orderId/shipment')
  .get(authorize('ADMIN', 'AGENT', 'SENDER'), getAllShipmentFromOrder)
  .post(authorize('ADMIN', 'AGENT', 'SENDER'), createShipmentInOrder);

router
  .route('/:orderId/shipment/:shipmentId')
  .get(authorize('ADMIN', 'AGENT', 'SENDER'), getShipmentFromOrder)
  .put(authorize('ADMIN', 'AGENT', 'SENDER'), updateShipmentInOrder)
  .delete(authorize('ADMIN'), deleteShipmentInOrder);

module.exports = router;
