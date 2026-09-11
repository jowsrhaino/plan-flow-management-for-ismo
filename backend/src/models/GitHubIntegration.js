const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GitHubIntegration = sequelize.define('GitHubIntegration', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  githubLogin: { type: DataTypes.STRING(100), allowNull: false },
  githubAvatarUrl: { type: DataTypes.STRING(500), allowNull: true },
  encryptedAccessToken: { type: DataTypes.TEXT, allowNull: false },
  connectedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'github_integrations', timestamps: true });

module.exports = GitHubIntegration;
