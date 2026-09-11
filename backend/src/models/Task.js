const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Tasks Table Definition
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false // எந்த Project-ன் கீழ் இந்த Task உள்ளது என்பதற்கான Foreign Key
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false // Task-ஐ நிர்வகிக்கும் உரிமையாளர் (Authorization)
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
    defaultValue: 'Pending'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

module.exports = Task;