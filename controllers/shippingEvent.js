const ShippingEvent = require('../models/ShippingEvent');
const asyncHandler = require('../middleware/async');
const Shipment = require('../models/Shipment');
const ErrorResponse = require('../utils/errorResponse');
const sendSms = require('../utils/sendSms');
const Receiver = require('../models/Receiver');

// @desc     Add New Event
// @route    Post /api/v1/shippingevent
// @access   private
exports.addNewEvent = asyncHandler(async (req, res, next) => {
  try {
    await validateEvent(req.body, next);
    const shippingEvent = await ShippingEvent.create(req.body);
    const shipment = await Shipment.findByPk(req.body.ShipmentId);
    const receiver = await Receiver.findByPk(shipment.ReceiverId);
    await sendSms(`Your shipment with id ${shipment.id} has been updated to ${shippingEvent.eventType}`, +receiver.phone);
    res.status(200).send({
      success: true,
      data: shippingEvent
    })
  }
  catch(err) {
    return next(err);
  }
});

// @desc     Get All events for shipment
// @route    Get /api/v1/shippingevent/shipment/:shipmentId
// @access  private

exports.getAllEvents = asyncHandler(async (req, res, next) => {
  const shippingEvent = await ShippingEvent.findAll({where: {ShipmentId: req.params.shipmentId}});
  if(!shippingEvent) {
    return next(new ErrorResponse(`A problem occured fetching shippingevents for shipment with id: ${req.params.shipmentId}`));
  }
  res.status(200).send({
    success: true,
    data: shippingEvent
  })
});

// @desc     Get single event for specified shipment
// @route    Get /api/v1/shippingevent/:shippingEventId
// @access   private
exports.getSingleEvent = asyncHandler(async (req, res, next) => {
  const shippingEvent = await ShippingEvent.findByPk(req.params.shippingEventId);
  if(!shippingEvent) {
    return next(new ErrorResponse(`No shipment found with specified id of ${req.params.shipmentId}`));
  }
  res.status(200).send({
    success: true,
    data: shippingEvent
  });
});

// @desc     Delete an event for shipment 
// @route    Put /api/v1/shippingevent/:shippingEventId/shipment/:shipmentId
// @access   private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const shippingEvent = await ShippingEvent.findByPk(req.params.shippingEventId);
  if(!shippingEvent) {
    return next(new ErrorResponse(`No shipment found with specified id of ${req.params.shippingEventId}`));
  }
  await shippingEvent.destroy();
  res.status(200).send({
    success: true,
    data: shippingEvent
  });
});

async function validateEvent(req, next) {
  const array = ['ACCEPTED', 'ON THE WAY', 'DELIVERED'];
  const indexi = array.indexOf(req.eventType);
  const shipmentEvents = await ShippingEvent.findAll({where: {ShipmentId: req.ShipmentId}, order: [['createdAt', 'desc']]});
  if(shipmentEvents.length != 0){
    const theEvent = shipmentEvents[0].eventType;
    const currentPos = array.indexOf(theEvent);
    if(currentPos > indexi || indexi != currentPos + 1) {
      throw new ErrorResponse(`Shipping event with specified event type cannot be added, delievery process missing!`);
    }
  }
  else{ 
    if(req.eventType != 'ACCEPTED') {
      throw new ErrorResponse(`The shipment should be accepted first!`);
    }
  }
}