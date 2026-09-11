const { Op } = require('sequelize');
const { Project, Task } = require('../models');

// 1. அனைத்து திட்டங்களையும் பெறுதல் (Search, Status Filter & Task Stats உடன்)
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, status } = req.query;

    const whereConditions = { userId };

    // Search by Name (SQL LIKE %search%)
    if (search) {
      whereConditions.name = { [Op.like]: `%${search}%` };
    }

    // Filter by Status
    if (status) {
      whereConditions.status = status;
    }

    // Project-களையும் அவற்றின் Tasks-களையும் எடுக்கிறோம்
    const projects = await Project.findAll({
      where: whereConditions,
      include: [
        {
          model: Task,
          attributes: ['id', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // ஒவ்வொரு project-க்கும் Task completion statistics கணக்கிடுகிறோம்
    const formattedProjects = projects.map((p) => {
      const totalTasks = p.Tasks.length;
      const completedTasks = p.Tasks.filter((t) => t.status === 'Completed').length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        createdAt: p.createdAt,
        totalTasks,
        completedTasks,
        progressPercentage
      };
    });

    res.status(200).json({ success: true, data: formattedProjects });
  } catch (error) {
    console.error('getProjects error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};

// 2. ஒற்றை Project-ன் விவரங்கள் மற்றும் அதன் Tasks (GET /api/projects/:id)
const getProjectById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id, userId }, // பயனர் தனக்குரியதை மட்டுமே பார்க்க முடியும்
      include: [
        {
          model: Task,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or access denied' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch project details' });
  }
};

// 3. புதிய Project உருவாக்குதல் (POST /api/projects)
const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, status, startDate, endDate } = req.body;

    const newProject = await Project.create({
      userId,
      name,
      description,
      status: status || 'Not Started',
      startDate: startDate || null,
      endDate: endDate || null
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
};

// 4. Project-ஐ மாற்றுதல் (PUT /api/projects/:id)
const createStarterProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const dateAfter = (days) => new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10);
    const templates = [
      ['PlanFlow Product Launch', 'A ready-to-customize launch plan with research, design, engineering, and release milestones.', 'In Progress', [['Define launch goals & success metrics', 'High', 'Completed', 2], ['Finalize product experience', 'High', 'In Progress', 7], ['Build launch landing page', 'High', 'Pending', 14]]],
      ['Customer Experience Refresh', 'Improve the support journey with research-backed service improvements.', 'In Progress', [['Review customer feedback', 'High', 'Completed', 3], ['Map service journey', 'Medium', 'In Progress', 9], ['Publish improvement plan', 'Medium', 'Pending', 18]]],
      ['Q4 Growth Campaign', 'A cross-channel campaign to drive qualified leads.', 'Not Started', [['Define campaign audience', 'High', 'Pending', 10], ['Create campaign assets', 'Medium', 'Pending', 20], ['Set up performance dashboard', 'Low', 'Pending', 35]]]
    ];
    const projects = [];
    for (const [name, description, status, tasks] of templates) {
      const project = await Project.create({ userId, name, description, status, startDate: dateAfter(0), endDate: dateAfter(30) });
      await Task.bulkCreate(tasks.map(([taskName, priority, taskStatus, dueIn]) => ({ userId, projectId: project.id, name: taskName, priority, status: taskStatus, dueDate: dateAfter(dueIn) })));
      projects.push(project);
    }
    res.status(201).json({ success: true, message: 'Sample workspace created successfully', data: projects });
  } catch (error) {
    console.error('createStarterProject error:', error);
    res.status(500).json({ success: false, error: 'Failed to create starter project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    const project = await Project.findOne({ where: { id, userId } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or access denied' });
    }

    await project.update({
      name: name !== undefined ? name : project.name,
      description: description !== undefined ? description : project.description,
      status: status !== undefined ? status : project.status,
      startDate: startDate !== undefined ? startDate : project.startDate,
      endDate: endDate !== undefined ? endDate : project.endDate
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
};

// 5. Project-ஐ நீக்குதல் (DELETE /api/projects/:id)
const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const project = await Project.findOne({ where: { id, userId } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or access denied' });
    }

    // Project நீக்கப்பட்டால் Cascade Rule படி அதன் Tasks தானாக நீங்கும்
    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Project and all its tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  createStarterProject,
  updateProject,
  deleteProject
};
