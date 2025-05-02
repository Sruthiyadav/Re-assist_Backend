
import express from 'express';
import Project from '../models/Project.js';
import Paper from '../models/Paper.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 📌 Create a new project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const { firebaseId } = req.user; // Extract firebaseId from JWT payload

    // Validate input
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Project name is required and must be a non-empty string' });
    }

    const newProject = new Project({ name, firebaseId });
    await newProject.save();

    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// 📌 Fetch all projects for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { firebaseId } = req.user;

    // Fetch projects and populate the 'papers' field
    const projects = await Project.find({ firebaseId }).populate('papers');

    // Normalize the response to ensure papers are always an array
    const normalizedProjects = projects.map((project) => ({
      ...project.toObject(),
      papers: project.papers || [],
    }));

    res.status(200).json({ projects: normalizedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// 📌 Add a paper to a project
router.put('/:projectId/add-paper', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { paperId } = req.body;

    // Validate input
    if (!projectId || !paperId) {
      return res.status(400).json({ message: 'Project ID and Paper ID are required' });
    }

    // Find the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the paper by ID
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Check if the paper is already added to the **current project**
    const isPaperAlreadyAdded = project.papers.some(
      (p) => p._id && p._id.toString() === paper._id.toString()
    );
    if (isPaperAlreadyAdded) {
      return res.status(400).json({ message: 'Paper is already added to this project' });
    }

    // Add the paper to the project's papers array
    project.papers.push({
      _id: paper._id,
      title: paper.title || 'Untitled Paper',
      url: paper.url || '',
      filePath: paper.filePath || '',
      uploadedAt: paper.uploadedAt || new Date(),
    });

    // Save the updated project
    await project.save();

    // Return success response
    res.status(200).json({
      message: 'Paper added to project successfully',
      project,
    });
  } catch (err) {
    console.error('Error adding paper to project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Delete a project by ID
router.delete('/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { firebaseId } = req.user;

    // Find the project by ID and ensure it belongs to the logged-in user
    const project = await Project.findOne({ _id: projectId, firebaseId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// 📌 DELETE - Delete Paper by ID from Project
router.delete('/:projectId/papers/:paperId', authMiddleware, async (req, res) => {
  try {
    const { firebaseId } = req.user; // Extract firebaseId from JWT payload
    const { projectId, paperId } = req.params;

    console.log('Deleting paper:', paperId, 'from project:', projectId, 'for user:', firebaseId);

    // Find the project by ID and ensure it belongs to the user
    const project = await Project.findOne({ _id: projectId, firebaseId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // console.log('Project found:', project);

    // Remove the paper from the papers array
    const updatedPapers = project.papers.filter((paper) => paper._id.toString() !== paperId);

    if (updatedPapers.length === project.papers.length) {
      // If no paper was removed, the paperId does not exist in the array
      return res.status(404).json({ message: 'Paper not found in the project' });
    }

    // Update the project with the modified papers array
    project.papers = updatedPapers;
    await project.save();

    console.log('Paper deleted successfully');

    // Return success response
    return res.status(200).json({ message: 'Paper deleted successfully' });
  } catch (err) {
    console.error('Error deleting paper:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;