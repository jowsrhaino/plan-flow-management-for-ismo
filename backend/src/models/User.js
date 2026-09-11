const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Users Table Definition
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // ஒரே Email-ல் இரண்டு அக்கவுண்ட் உருவாகாமல் தடுக்கிறது
    validate: {
      isEmail: { msg: 'Must be a valid email address' }
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false // எப்போதுமே Plain text பாஸ்வர்ட் சேமிக்கப்படாது
  }
}, {
  tableName: 'users',
  timestamps: true // createdAt மற்றும் updatedAt தானாக உருவாக்கப்படும்
});

module.exports = User;