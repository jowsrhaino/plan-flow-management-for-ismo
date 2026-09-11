const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { projectValidation } = require('../middleware/validator');

// அனைத்து project routes-க்கும் Login செய்திருக்க வேண்டும் (JWT)
router.use(authenticateJWT);

router.get('/', projectController.getProjects);
router.post('/starter', projectController.createStarterProject);
router.get('/:id', projectController.getProjectById);
router.post('/', projectValidation, projectController.createProject);
router.put('/:id', projectValidation, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
