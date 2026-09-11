const { Project, Task } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Projects Metrics
    const totalProjects = await Project.count({ where: { userId } });
    const projectsInProgress = await Project.count({ where: { userId, status: 'In Progress' } });
    const projectsCompleted = await Project.count({ where: { userId, status: 'Completed' } });
    const projectsNotStarted = await Project.count({ where: { userId, status: 'Not Started' } });

    // 2. Tasks Metrics
    const totalTasks = await Task.count({ where: { userId } });
    const completedTasks = await Task.count({ where: { userId, status: 'Completed' } });
    const pendingTasks = await Task.count({ where: { userId, status: 'Pending' } });
    const tasksInProgress = await Task.count({ where: { userId, status: 'In Progress' } });

    // 3. சமீபத்திய 5 Projects (Recent Projects)
    const recentProjects = await Project.findAll({
      where: { userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: Task, attributes: ['id', 'status'] }]
    });

    const formattedRecentProjects = recentProjects.map((p) => {
      const tCount = p.Tasks.length;
      const cCount = p.Tasks.filter((t) => t.status === 'Completed').length;
      const pct = tCount > 0 ? Math.round((cCount / tCount) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        totalTasks: tCount,
        completedTasks: cCount,
        progressPercentage: pct
      };
    });

    // 4. அடுத்து வரவிருக்கும் அவசர Tasks (Upcoming Tasks)
    const upcomingTasks = await Task.findAll({
      where: { userId, status: ['Pending', 'In Progress'] },
      limit: 5,
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC']
      ],
      include: [{ model: Project, attributes: ['name'] }]
    });

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        projectsInProgress,
        projectsCompleted,
        projectsNotStarted,
        totalTasks,
        completedTasks,
        pendingTasks,
        tasksInProgress,
        recentProjects: formattedRecentProjects,
        upcomingTasks
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate dashboard metrics' });
  }
};

module.exports = { getDashboardStats };