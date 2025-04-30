// import express from 'express';
// import Project from '../models/Project.js';
// import Paper from '../models/Paper.js';
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// // 📌 POST - Create a new project
// // router.post('/', async (req, res) => {
// //   try {
// //     const { name } = req.body;
// //     if (!name) {
// //       return res.status(400).json({ message: 'Project name is required' });
// //     }

// //     const project = new Project({ name });
// //     await project.save();
// //     res.status(201).json({ message: 'Project created successfully', project });
// //   } catch (err) {
// //     console.error('Error creating project:', err);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // });

// // // 📌 GET - Get all projects with their papers
// // router.get('/', async (req, res) => {
// //     try {
// //       // Fetch all projects and populate the 'papers' array
// //       const projects = await Project.find().populate('papers._id'); // Populate papers from the Paper model
// //       res.status(200).json({ projects });
// //     } catch (err) {
// //       console.error('Error fetching projects:', err);
// //       res.status(500).json({ error: 'Server error' });
// //     }
// //   });

// router.post('/', authMiddleware, async (req, res) => {
//   try {
//     const { name } = req.body;
//     const { firebaseId } = req.user; // Extract firebaseId from JWT payload

//     const newProject = new Project({ name, firebaseId });
//     await newProject.save();

//     res.status(201).json(newProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// });

// // Fetch all projects for the logged-in user
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const { firebaseId } = req.user;

//     const projects = await Project.find({ firebaseId }).populate('papers');
//     res.status(200).json({ projects });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// });

// // 📌 PUT - Add a paper to a project
// // 📌 PUT - Add a paper to a project
// // router.put('/:projectId/add-paper', async (req, res) => {
// //     try {
// //       const { projectId } = req.params;
// //       const { paperId } = req.body;
  
// //       if (!projectId || !paperId) {
// //         return res.status(400).json({ message: 'Project ID and Paper ID are required' });
// //       }
  
// //       const project = await Project.findById(projectId);
// //       if (!project) {
// //         return res.status(404).json({ message: 'Project not found' });
// //       }
  
// //       const paper = await Paper.findById(paperId);
// //       if (!paper) {
// //         return res.status(404).json({ message: 'Paper not found' });
// //       }
  
// //       // Add paper to the project's papers array
// //       project.papers.push({
// //         _id: paper._id,
// //         title: paper.title, // Ensure title is included
// //         url: paper.url,
// //         filePath: paper.filePath,
// //         uploadedAt: paper.uploadedAt,
// //       });
  
// //       await project.save();
// //       res.status(200).json({ message: 'Paper added to project successfully', project });
// //     } catch (err) {
// //       console.error('Error adding paper to project:', err);
// //       res.status(500).json({ error: 'Server error' });
// //     }
// //   });


// router.put('/:projectId/add-paper', async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { paperId } = req.body;

//     // Validate input
//     if (!projectId || !paperId) {
//       return res.status(400).json({ message: 'Project ID and Paper ID are required' });
//     }

//     // Find the project by ID
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }

//     // Find the paper by ID
//     const paper = await Paper.findById(paperId);
//     if (!paper) {
//       return res.status(404).json({ message: 'Paper not found' });
//     }

//     // Check if the paper is already added to the project
//     const isPaperAlreadyAdded = project.papers.some((p) => p._id.toString() === paper._id.toString());
//     if (isPaperAlreadyAdded) {
//       return res.status(400).json({ message: 'Paper is already added to this project' });
//     }

//     // Add the paper to the project's papers array
//     project.papers.push({
//       _id: paper._id,
//       title: paper.title, // Include the paper's title
//       url: paper.url,     // Include the paper's URL
//       filePath: paper.filePath, // Include the file path (if applicable)
//       uploadedAt: paper.uploadedAt, // Include the upload timestamp
//     });

//     // Save the updated project
//     await project.save();

//     // Return success response
//     res.status(200).json({
//       message: 'Paper added to project successfully',
//       project,
//     });
//   } catch (err) {
//     console.error('Error adding paper to project:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });


// export default router;

// import express from 'express';
// import Project from '../models/Project.js';
// import Paper from '../models/Paper.js';
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// // 📌 Create a new project
// router.post('/', authMiddleware, async (req, res) => {
//   try {
//     const { name } = req.body;
//     const { firebaseId } = req.user; // Extract firebaseId from JWT payload

//     // Validate input
//     if (!name || typeof name !== 'string' || name.trim() === '') {
//       return res.status(400).json({ message: 'Project name is required and must be a non-empty string' });
//     }

//     const newProject = new Project({ name, firebaseId });
//     await newProject.save();

//     res.status(201).json({ message: 'Project created successfully', project: newProject });
//   } catch (error) {
//     console.error('Error creating project:', error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// });

// // 📌 Fetch all projects for the logged-in user
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const { firebaseId } = req.user;

//     // Fetch projects and populate the 'papers' field
//     const projects = await Project.find({ firebaseId }).populate('papers');

//     // Normalize the response to ensure papers are always an array
//     const normalizedProjects = projects.map((project) => ({
//       ...project.toObject(),
//       papers: project.papers || [],
//     }));

//     res.status(200).json({ projects: normalizedProjects });
//   } catch (error) {
//     console.error('Error fetching projects:', error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// });

// // 📌 Add a paper to a project
// router.put('/:projectId/add-paper', authMiddleware, async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { paperId } = req.body;

//     // Validate input
//     if (!projectId || !paperId) {
//       return res.status(400).json({ message: 'Project ID and Paper ID are required' });
//     }

//     // Find the project by ID
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }

//     // Find the paper by ID
//     const paper = await Paper.findById(paperId);
//     if (!paper) {
//       return res.status(404).json({ message: 'Paper not found' });
//     }

//     // Check if the paper is already added to the project
//     const isPaperAlreadyAdded = project.papers.some(
//       (p) => p._id && p._id.toString() === paper._id.toString()
//     );
//     if (isPaperAlreadyAdded) {
//       return res.status(400).json({ message: 'Paper is already added to this project' });
//     }

//     // Add the paper to the project's papers array
//     project.papers.push({
//       _id: paper._id,
//       title: paper.title || 'Untitled Paper',
//       url: paper.url || '',
//       filePath: paper.filePath || '',
//       uploadedAt: paper.uploadedAt || new Date(),
//     });

//     // Save the updated project
//     await project.save();

//     // Return success response
//     res.status(200).json({
//       message: 'Paper added to project successfully',
//       project,
//     });
//   } catch (err) {
//     console.error('Error adding paper to project:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // 📌 Export the router
// export default router;


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

// 📌 Export the router
export default router;