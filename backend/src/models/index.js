const { sequelize } = require('../config/db');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const GitHubIntegration = require('./GitHubIntegration');

// 1. User <-> Project Relationship (1:N)
// ஒரு பயனர் பல திட்டங்களை உருவாக்கலாம்
User.hasMany(Project, { foreignKey: 'userId', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId' });

// 2. User <-> Task Relationship (1:N)
// ஒரு பயனர் பல பணிகளை நிர்வகிக்கலாம்
User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

// 3. Project <-> Task Relationship (1:N)
// ஒரு திட்டத்தில் பல பணிகள் இருக்கும்
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasOne(GitHubIntegration, { foreignKey: 'userId', onDelete: 'CASCADE' });
GitHubIntegration.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  GitHubIntegration
};
