const Shipment = require('./Shipment');
const Package = require('./Package');
const Order = require('./Order');
const Receiver = require('./Receiver');
const User = require('./User');
const Filiali = require('./Filiali');
const ShippingEvent = require('./ShippingEvent');

(async () => {
  // Relations on Shipment

  // User.belongsTo(Filiali);
  await Shipment.sync({ force: true });
  await Package.sync({ force: true });
  await Order.sync({ force: true });
  await Receiver.sync({ force: true });
  await User.sync({ force: true });
  await Filiali.sync({ force: true });
  await ShippingEvent.sync({force: true});

  //////////////////////////////////////////////////////////
  //User Relations
  User.hasOne(Filiali, { foreignKey: 'OwnerId' });
  Filiali.belongsTo(User, { foreignKey: 'OwnerId' });

  Filiali.hasMany(User, { foreignKey: 'FilialiId' });
  User.belongsTo(Filiali, { foreignKey: 'FilialiId' });

  //////////////////////////////////////////////////////////
  //Shipment And Packeges one to one Shipment belongs to package??
  Package.hasOne(Shipment);
  Shipment.belongsTo(Package);
  //One Order Has Many Shipments
  Order.hasMany(Shipment);
  Shipment.belongsTo(Order);
  // One Order has One Sender and One Agent
  //Agent&Order
  User.hasMany(Order, { foreignKey: 'AgentId' });
  Order.belongsTo(User, { foreignKey: 'AgentId' });
  //Sender & Order
  User.hasMany(Order, { foreignKey: 'SenderId', onDelete: 'NO ACTION' });
  Order.belongsTo(User, { foreignKey: 'SenderId' });

  //Shipment & Receiver One to One
  Receiver.hasOne(Shipment);
  Shipment.belongsTo(Receiver);

  //Receiver & User (Who owns the Receiver)
  User.hasMany(Receiver, { foreignKey: 'OwnerId' });
  Receiver.belongsTo(User, { foreignKey: 'OwnerId' });

  //Order belongs to filiali, Order HasOne Fililai
  Filiali.hasOne(Order);
  Order.belongsTo(Filiali);

  // A shipment has many shipping event
  Shipment.hasMany(ShippingEvent);
  ShippingEvent.belongsTo(Shipment);

  // A shipment event has many user
  User.hasMany(ShippingEvent);
  ShippingEvent.belongsTo(User);

  await Shipment.sync({ force: true });
  await Package.sync({ force: true });
  await Order.sync({ force: true });
  await Receiver.sync({ force: true });
  await User.sync({ force: true });
  await Filiali.sync({ force: true });
  await ShippingEvent.sync({ force: true });
})();
