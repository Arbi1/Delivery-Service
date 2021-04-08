const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const Filiali = require('./Filiali');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class User extends Model {
  // you can enter methods here

  generateHash(password) {
    return bcrypt.hash(password, bcrypt.genSaltSync(8));
  }
  validPassword(password) {
    return bcrypt.compare(password, this.password);
  }
  getSignedJwtToken() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }
  matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  getResetPasswordToken = function() {
    // Generate the token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hash token and set to resetPasswordToken field in database
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    // set expire date
    this.resetpasswordExpire = Date.now() + 24 * 60 * 60 * 1000;
    return resetToken;
  };
}

User.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Name is not allowed to be null' },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'LastName is not allowed to be null' },
      },
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'You entered an invailid email',
        },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 30],
      },
    },

    role: {
      type: DataTypes.ENUM('ADMIN', 'AGENT', 'POSTMAN', 'SENDER'),
      allowNull: false,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetpasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    FilialiId: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
  }
);

// Encrypt the password
User.beforeSave(async (user, options) => {
  const salt = await bcrypt.genSalt(8);
  user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;
