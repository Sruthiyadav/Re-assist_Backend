// // routes/papers.js
// import express from 'express';
// import multer from 'multer';
// import AWS from 'aws-sdk';
// import { v4 as uuidv4 } from 'uuid';
// import Paper from '../models/Paper.js';

// const router = express.Router();

// // AWS S3 Config
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // Multer setup (to handle form-data files)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // 📌 POST - Add Paper via URL or File
// router.post('/upload', upload.array('files'), async (req, res) => {
//   console.log('Upload route hit');
//   try {
//     const { title } = req.body;
//     const files = req.files;

//     // If user provided URL
//     if (req.body.url) {
//       const paper = new Paper({ title, url: req.body.url });
//       await paper.save();
//       return res.status(201).json({ message: 'Paper added via URL', paper });
//     }

//     // Else, handle file uploads
//     if (files && files.length > 0) {
//       const uploadedPapers = [];
//       for (const file of files) {
//         const fileName = `${uuidv4()}-${file.originalname}`;
//         const params = {
//           Bucket: process.env.AWS_BUCKET_NAME,
//           Key: fileName,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//         };

//         const data = await s3.upload(params).promise();
//         const paper = new Paper({
//           title: title || file.originalname,
//           filePath: data.Location,
//         });
//         await paper.save();
//         uploadedPapers.push(paper);
//       }
//       return res.status(201).json({ message: 'Files uploaded and saved', papers: uploadedPapers });
//     }

//     return res.status(400).json({ message: 'No URL or files provided' });
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// export default router;

import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import Paper from '../models/Paper.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Middleware to extract user data

const router = express.Router();

// AWS S3 Config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer setup (to handle form-data files)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 POST - Add Paper via URL or File
router.post('/upload', authMiddleware, upload.array('files'), async (req, res) => {
  console.log('Upload route hit');
  try {
    const { firebaseId } = req.user; // Extract firebaseId from JWT payload
    const { title } = req.body;
    const files = req.files;

    // If user provided URL
    if (req.body.url) {
      const paper = new Paper({
        title,
        url: req.body.url,
        firebaseId, // Include firebaseId
      });
      await paper.save();
      return res.status(201).json({ message: 'Paper added via URL', paper });
    }

    // Else, handle file uploads
    if (files && files.length > 0) {
      const uploadedPapers = [];
      for (const file of files) {
        const fileName = `${uuidv4()}-${file.originalname}`;
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const data = await s3.upload(params).promise();
        const paper = new Paper({
          title: title || file.originalname,
          url: data.Location,
          firebaseId, // Include firebaseId
        });
        await paper.save();
        uploadedPapers.push(paper);
      }
      return res.status(201).json({ message: 'Files uploaded and saved', papers: uploadedPapers });
    }

    return res.status(400).json({ message: 'No URL or files provided' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;