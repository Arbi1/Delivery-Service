const { Sequelize } = require('sequelize');

// Option 1: Passing a connection URI
module.exports = sequelize = new Sequelize(
  'postgres://postgres:kismet@localhost:7771/posta'
);
// Example for postgres

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
