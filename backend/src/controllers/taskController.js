const { Op } = require('sequelize');
const { Task, Project } = require('../models');

// 1. அனைத்து Tasks பெறுதல் (Filters: search, status, priority, projectId)
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, status, priority, projectId } = req.query;

    const whereConditions = { userId };

    if (search) {
      whereConditions.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      whereConditions.status = status;
    }
    if (priority) {
      whereConditions.priority = priority;
    }
    if (projectId) {
      whereConditions.projectId = projectId;
    }

    const tasks = await Task.findAll({
      where: whereConditions,
      include: [
        {
          model: Project,
          attributes: ['id', 'name'] // எந்த Project-ன் கீழ் உள்ளது என்ற பெயர் வரும்
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};

// 2. Task By ID (GET /api/tasks/:id)
const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId },
      include: [{ model: Project, attributes: ['id', 'name'] }]
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found or access denied' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
};

// 3. Task உருவாக்குதல் (POST /api/tasks)
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, name, description, priority, status, dueDate } = req.body;

    // பாதுகாப்புக் கட்டுப்பாடு: பயனர் தன் சொந்த Project-ல் மட்டுமே Task சேர்க்க வேண்டும்
    const project = await Project.findOne({ where: { id: projectId, userId } });
    if (!project) {
      return res.status(403).json({
        success: false,
        error: 'Target project not found or you do not have permission to add tasks to it.'
      });
    }

    const newTask = await Task.create({
      projectId,
      userId,
      name,
      description,
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate: dueDate || null
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
};

// 4. Task மாற்றுதல் அல்லது Complete செய்தல் (PUT /api/tasks/:id)
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, priority, status, dueDate, projectId } = req.body;

    const task = await Task.findOne({ where: { id, userId } });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found or access denied' });
    }

    // ஒருவேளை Project-ஐ மாற்றினால், அந்த புதிய Project இந்த பயனருடையதா என சரிபார்க்கிறோம்
    if (projectId && projectId !== task.projectId) {
      const pCheck = await Project.findOne({ where: { id: projectId, userId } });
      if (!pCheck) {
        return res.status(403).json({ success: false, error: 'Unauthorized target project.' });
      }
      task.projectId = projectId;
    }

    if (name !== undefined) task.name = name;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
};

// 5. Task நீக்குதல் (DELETE /api/tasks/:id)
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, userId } });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found or access denied' });
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};