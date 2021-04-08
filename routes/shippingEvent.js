const express = require('express');
const {
    addNewEvent,
    getAllEvents,
    getSingleEvent,
    deleteEvent
} = require('../controllers/shippingEvent');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(authorize('ADMIN', 'AGENT', 'POSTMAN'), addNewEvent);

router
  .route('/shipment/:shipmentId')
  .get(authorize('ADMIN', 'AGENT', 'POSTMAN'), getAllEvents);

router
  .route('/:shippingEventId')
  .get(authorize('ADMIN', 'AGENT', 'POSTMAN'), getSingleEvent)
  .delete(authorize('ADMIN'), deleteEvent);


module.exports = router;