const express = require('express');
const {
  createReceiver,
  deleteReceiver,
  getReceivers,
  updateReceiver,
  getReceiver,
} = require('../controllers/receiver');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(authorize('ADMIN', 'AGENT', 'SENDER'), getReceivers)
  .post(authorize('ADMIN', 'AGENT', 'SENDER'), createReceiver);

router
  .route('/:id')
  .put(authorize('ADMIN', 'AGENT', 'SENDER'), updateReceiver)
  .get(authorize('ADMIN', 'AGENT', 'SENDER'), getReceiver)
  .delete(authorize('ADMIN', 'AGENT', 'SENDER'), deleteReceiver);

module.exports = router;
