import express from 'express';
import Project from '../models/Project.js';
import Paper from '../models/Paper.js';
import authMiddleware from '../middleware/authMiddleware.js';
import AWS from 'aws-sdk';

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const router = express.Router();

// 📌 Create a new project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const { firebaseId } = req.user;
    // console.log("FirebaseId:",firebaseId)

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

// Fetch all projects for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { firebaseId } = req.user;
    console.log("FirebaseId:",firebaseId)
    const projects = await Project.find({ firebaseId });
    const normalizedProjects = projects.map((project) => ({
      ...project.toObject(),
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
    const { paperId, ...paperData } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let paper;

    if (paperId) {
      // Case 1: paperId provided, fetch existing paper
      paper = await Paper.findById(paperId);
      if (!paper) {
        return res.status(404).json({ message: 'Paper not found' });
      }
    } else if (paperData._id) {
      // Case 2: full paper object with _id
      paper = paperData;
    } else {
      return res.status(400).json({ message: 'Paper ID or valid paper data is required' });
    }

    const alreadyAdded = project.papers.some(
      (p) => p._id && p._id.toString() === paper._id.toString()
    );
    if (alreadyAdded) {
      return res.status(400).json({ message: 'Paper already added to this project' });
    }

    project.papers.push({
      _id: paper._id,
      title: paper.title || 'Untitled Paper',
      url: paper.url || '',
      abstract:paper.abstract || '',
      keywords: Array.isArray(paper.keywords) ? paper.keywords : [],
      uploadedAt: paper.uploadedAt || new Date(),
    });

    await project.save();

    res.status(200).json({ message: 'Paper added successfully', project });
  } catch (err) {
    console.error('Error adding paper:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Attach a document to a project
router.post('/:projectId/attach-document', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { documentId, title, url } = req.body;

    if (!projectId || !documentId || !title || !url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if document is already attached
    const alreadyAttached = project.documents.some(doc => doc._id && doc._id.toString() === documentId.toString());
    if (alreadyAttached) {
      return res.status(400).json({ message: 'Document already attached to this project' });
    }

    // Push new document into documents array
    project.documents.push({
      _id: documentId,
      title,
      url,
      uploadedAt: new Date(),
    });

    await project.save();

    res.status(200).json({ message: 'Document attached successfully', project });
  } catch (err) {
    console.error('Error attaching document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Delete a project by ID
router.delete('/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { firebaseId } = req.user;

    const project = await Project.findOne({ _id: projectId, firebaseId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});


router.delete('/:projectId/papers/:paperId', authMiddleware, async (req, res) => {
  try {
    const { firebaseId } = req.user;
    const { projectId, paperId } = req.params;

    console.log('Deleting paper:', paperId, 'from project:', projectId, 'for user:', firebaseId);

    // Find the project by ID and ensure it belongs to the user
    const project = await Project.findOne({ _id: projectId, firebaseId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // Find the paper to delete
    const paperToDelete = project.papers.find((paper) => paper._id.toString() === paperId);
    if (!paperToDelete) {
      return res.status(404).json({ message: 'Paper not found in the project' });
    }

    const fileUrl = paperToDelete.url; // Full URL of the file
    if (!fileUrl) {
      console.warn('No file URL found for the paper:', paperId);
      return res.status(400).json({ message: 'Paper does not have an associated file in S3' });
    }

    // Extract the object key from the full URL
    const filePath = new URL(fileUrl).pathname.substring(1); // Remove leading '/'
    console.log('Extracted file path (object key):', filePath);

    // Validate the extracted object key
    if (!filePath || filePath.trim() === '') {
      console.error('Invalid object key extracted from file URL:', fileUrl);
      return res.status(500).json({ error: 'Failed to extract valid object key from file URL' });
    }

    // Delete the file from AWS S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath, // Use the extracted object key
    };

    console.log('Attempting to delete file from S3:', params);

    try {
      await s3.deleteObject(params).promise();
      console.log('File deleted successfully from S3:', filePath);
    } catch (s3Error) {
      console.error('Error deleting file from S3:', s3Error.message);
      return res.status(500).json({ error: 'Failed to delete file from S3', details: s3Error.message });
    }

    // Remove the paper from the papers array
    const updatedPapers = project.papers.filter((paper) => paper._id.toString() !== paperId);
    project.papers = updatedPapers;
    await project.save();

    console.log('Paper deleted successfully');

    return res.status(200).json({ message: 'Paper deleted successfully' });
  } catch (err) {
    console.error('Error deleting paper:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.put('/:projectId/add-bib', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { bibData } = req.body;

    if (!projectId || !bibData || !Array.isArray(bibData)) {
      return res.status(400).json({ message: 'Project ID and valid bibData are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Save each entry in the bibEntries array
    project.bibEntries.push(...bibData.map(entry => ({ entry })));

    await project.save();
    res.status(200).json({ message: '.bib entries added to project successfully', project });
  } catch (err) {
    console.error('Error adding .bib entries to project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Delete a .bib entry by ID from a project
router.delete('/:projectId/bib/:bibId', authMiddleware, async (req, res) => {
  try {
    const { firebaseId } = req.user;
    const { projectId, bibId } = req.params;

    console.log('Deleting .bib entry:', bibId, 'from project:', projectId, 'for user:', firebaseId);

    // Find the project by ID and ensure it belongs to the user
    const project = await Project.findOne({ _id: projectId, firebaseId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // Find the .bib entry to delete
    const bibEntryToDelete = project.bibEntries.find((bibEntry) => bibEntry._id.toString() === bibId);
    if (!bibEntryToDelete) {
      return res.status(404).json({ message: '.bib entry not found in the project' });
    }

    // Remove the .bib entry from the bibEntries array
    const updatedBibEntries = project.bibEntries.filter((bibEntry) => bibEntry._id.toString() !== bibId);
    project.bibEntries = updatedBibEntries;

    // Save the updated project
    await project.save();

    console.log('.bib entry deleted successfully');
    return res.status(200).json({ message: '.bib entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting .bib entry:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;