const express = require('express');
const {
  getAllFilialis,
  getFilial,
  createFilial,
  updateFilial,
  deleteFilial,
} = require('../../controllers/filial');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(authorize('ADMIN'), getAllFilialis)
  .post(authorize('ADMIN'), createFilial);

router
  .route('/:id')
  .put(authorize('ADMIN', 'AGENT'), updateFilial)
  .get(authorize('ADMIN', 'AGENT'), getFilial)
  .delete(authorize('ADMIN', 'AGENT'), deleteFilial);

module.exports = router;
