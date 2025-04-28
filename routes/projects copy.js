import express from 'express';
import Project from '../models/Project.js';
import Paper from '../models/Paper.js';
import { authenticateUser } from '../middleware/authenticateUser.js'
const router = express.Router();

// 📌 POST - Create a new project
// router.post('/', async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) {
//       return res.status(400).json({ message: 'Project name is required' });
//     }

//     const project = new Project({ name });
//     await project.save();
//     res.status(201).json({ message: 'Project created successfully', project });
//   } catch (err) {
//     console.error('Error creating project:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// 📌 POST - Create a new project
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name } = req.body;
    const { firebaseId } = req.user; // Extract firebaseId from the authenticated user

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = new Project({ name, user: firebaseId });
    await project.save();

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// // 📌 GET - Get all projects with their papers
// router.get('/', async (req, res) => {
//     try {
//       // Fetch all projects and populate the 'papers' array
//       const projects = await Project.find().populate('papers._id'); // Populate papers from the Paper model
//       res.status(200).json({ projects });
//     } catch (err) {
//       console.error('Error fetching projects:', err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });


// 📌 GET - Get all projects for a specific user
router.get('/user', authenticateUser, async (req, res) => {
  try {
    const { firebaseId } = req.user; // Extract firebaseId from the authenticated user

    // Fetch all projects for the user and populate the 'papers' array
    const projects = await Project.find({ user: firebaseId }).populate('papers._id');
    res.status(200).json({ projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 📌 PUT - Add a paper to a project
// router.put('/:projectId/add-paper', async (req, res) => {
//     try {
//       const { projectId } = req.params;
//       const { paperId } = req.body;
  
//       if (!projectId || !paperId) {
//         return res.status(400).json({ message: 'Project ID and Paper ID are required' });
//       }
  
//       const project = await Project.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ message: 'Project not found' });
//       }
  
//       const paper = await Paper.findById(paperId);
//       if (!paper) {
//         return res.status(404).json({ message: 'Paper not found' });
//       }
  
//       // Add paper to the project's papers array
//       project.papers.push({
//         _id: paper._id,
//         title: paper.title, // Ensure title is included
//         url: paper.url,
//         filePath: paper.filePath,
//         uploadedAt: paper.uploadedAt,
//       });
  
//       await project.save();
//       res.status(200).json({ message: 'Paper added to project successfully', project });
//     } catch (err) {
//       console.error('Error adding paper to project:', err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

// 📌 PUT - Add a paper to a project
router.put('/:projectId/add-paper', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { paperId } = req.body;
    const { firebaseId } = req.user; // Extract firebaseId from the authenticated user

    if (!projectId || !paperId) {
      return res.status(400).json({ message: 'Project ID and Paper ID are required' });
    }

    const project = await Project.findOne({ _id: projectId, user: firebaseId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or does not belong to the user' });
    }

    const paper = await Paper.findOne({ _id: paperId, user: firebaseId });
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found or does not belong to the user' });
    }

    // Add paper to the project's papers array
    project.papers.push({
      _id: paper._id,
      title: paper.title,
      url: paper.url,
      filePath: paper.filePath,
      uploadedAt: paper.uploadedAt,
    });

    await project.save();
    res.status(200).json({ message: 'Paper added to project successfully', project });
  } catch (err) {
    console.error('Error adding paper to project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;