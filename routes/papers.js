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
// router.post('/upload', authMiddleware, upload.array('files'), async (req, res) => {
//   console.log('Upload route hit');
//   try {
//     const { firebaseId } = req.user; // Extract firebaseId from JWT payload
//     // const { title } = req.body;
//     const files = req.files;
//     console.log("paper data:",files)
//     const { title, abstract, keywords } = req.body;
// // If keywords is JSON string, parse it:
//     const parsedKeywords = JSON.parse(keywords || '[]');
//     console.log(parsedKeywords)

//     // If user provided URL
//     if (req.body.url) {
//       const paper = new Paper({
//         title,
//         url: req.body.url,
//         firebaseId, // Include firebaseId
//       });
//       await paper.save();
//       return res.status(201).json({ message: 'Paper added via URL', paper });
//     }

//     // Else, handle file uploads
//     if (files && files.length > 0) {
//       const uploadedPapers = [];
//       for (const file of files) {
//         const fileName =  `papers/${Date.now()}-${file.originalname}`;
//         const params = {
//           Bucket: process.env.AWS_BUCKET_NAME,
//           Key: fileName,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//         };

//         const data = await s3.upload(params).promise();
//         const paper = new Paper({
//           title: title || file.originalname,
//           url: data.Location,
//           firebaseId, // Include firebaseId
//         });
//         await paper.save();
//         uploadedPapers.push(paper);
//       }
//       return res.status(201).json({ message: 'Files uploaded and saved', papers: uploadedPapers });
//     }

//     return res.status(400).json({ message: 'No URL or files provided' });
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ error: 'Server error', details: err.message });
//   }
// });


router.post('/upload', authMiddleware, upload.array('files'), async (req, res) => {
  console.log('Upload route hit');
  try {
    const { firebaseId } = req.user;
    const files = req.files;
    let { title, abstract, keywords } = req.body;
abstract = typeof abstract === 'string' ? abstract : abstract?.text || '';

console.log('abstract received:', abstract);

    // Parse keywords if passed as JSON string
    const parsedKeywords = keywords ? JSON.parse(keywords) : [];

    // If uploading via URL
    if (req.body.url) {
      const paper = new Paper({
        title,
        url: req.body.url,
        firebaseId,
        abstract,
        keywords: parsedKeywords,
      });
      await paper.save();
      return res.status(201).json({ message: 'Paper added via URL', paper });
    }

    // If uploading file(s)
    if (files && files.length > 0) {
      const uploadedPapers = [];

      for (const file of files) {
        const fileName = `papers/${Date.now()}-${file.originalname}`;
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
          firebaseId,
          abstract, // 🆕 Save abstract
          keywords: parsedKeywords, // 🆕 Save keywords
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



router.get('/papers', authMiddleware, async (req, res) => {
  console.log('Fetching papers route hit');
  try {
    // Fetch papers from the database, possibly filter by user if needed
    const papers = await Paper.find({ firebaseId: req.user.firebaseId }); // Filter papers by the authenticated user

    if (papers.length === 0) {
      return res.status(404).json({ message: 'No papers found' });
    }

    // Format the response to include title, URL, abstract, and keywords
    const formattedPapers = papers.map(paper => ({
      title: paper.title,
      url: paper.url,
      abstract: paper.abstract, // Include abstract
      keywords: paper.keywords, // Include keywords
    }));

    return res.status(200).json({ papers: formattedPapers });
  } catch (err) {
    console.error('Fetch papers error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});




export default router;