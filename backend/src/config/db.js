const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize ORM instance உருவாக்கம்
const sequelize = new Sequelize(
  process.env.DB_NAME || 'project_management_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false, // console-ல் தேவையில்லாத பெரிய SQL logs வராமல் இருக்க
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Database இணைப்பு சரியாக உள்ளதா என சோதிக்கும் Function
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(' MySQL Database connected successfully via Sequelize ORM!');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };