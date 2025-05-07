// import express from 'express';
// import bcrypt from 'bcryptjs';
// import multer from 'multer';
// import AWS from 'aws-sdk';
// import dotenv from 'dotenv';
// import Profile from '../models/Profile.js';

// dotenv.config();
// const router = express.Router();

// // Multer middleware for parsing file uploads (stored in memory)
// const upload = multer();

// // AWS S3 Configuration
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: 'ap-south-1'
// });

// // Upload function
// const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
//   const params = {
//     Bucket: 're-assist-int',
//     Key: `profile/${Date.now()}_${fileName}`,
//     Body: fileBuffer,
//     ContentType: mimeType,
  
//   };

//   const data = await s3.upload(params).promise();
//   return data.Location; // S3 URL
// };

// // Signup route
// router.post('/register', async (req, res) => {
//   const { email, password, confirmPassword, firebaseId } = req.body;

//   try {
//     // Validations
//     if (!email || !password || !confirmPassword || !firebaseId) {
//       return res.status(400).json({ message: 'Please fill all fields' });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: 'Passwords do not match' });
//     }

//     const existingUser = await Profile.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: 'Email already exists' });
//     }

//     const existingFirebase = await Profile.findOne({ firebaseId });
//     if (existingFirebase) {
//       return res.status(409).json({ message: 'Firebase ID already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new Profile({
//       email,
//       password: hashedPassword,
//       firebaseId
//     });

//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully' });

//   } catch (err) {
//     console.error('Registration error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.put('/update-profile', upload.array('papers'), async (req, res) => {
//   const {
//     firebaseId,
//     fullName,
//     institution,
//     position,
//     researchInterests,
//     bio,
//     publications: publicationsJSON,
//   } = req.body;

//   try {
//     const user = await Profile.findOne({ firebaseId });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Update basic info
//     user.fullName = fullName || user.fullName;
//     user.institution = institution || user.institution;
//     user.position = position || user.position;
//     user.researchInterests = researchInterests
//       ? JSON.parse(researchInterests)
//       : user.researchInterests;
//     user.bio = bio || user.bio;

//     // Publications and file upload
//     const incomingPubs = publicationsJSON ? JSON.parse(publicationsJSON) : [];
//     const uploadedFiles = req.files || [];

//     const updatedPublications = await Promise.all(
//       incomingPubs.map(async (pub, idx) => {
//         const file = uploadedFiles[idx];
//         if (file) {
//           try {
//             const fileUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype);
//             return { ...pub, file: fileUrl };
//           } catch (err) {
//             console.error('S3 Upload Error:', err);
//             return pub; // Return without file if upload fails
//           }
//         }
//         return pub;
//       })
//     );

//     user.publications = updatedPublications;

//     await user.save();
//     res.status(200).json({ message: 'Profile updated successfully', user });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal Server Error', error });
//   }
// });




// // Fetch user profile route (using GET method)
// router.get('/profile', async (req, res) => {
//     const { firebaseId } = req.query;
  
//     try {
//       const user = await Profile.findOne({ firebaseId });
  
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       res.status(200).json({
//         fullName: user.fullName,
//         institution: user.institution,
//         position: user.position,
//         researchInterests: user.researchInterests,
//         bio: user.bio
//         // stats: {
//         //   citations: user.citations || 0,
//         //   hIndex: user.hIndex || 0,
//         //   i10Index: user.i10Index || 0
//         // },
//         // coauthors: user.coauthors || []
//       });
  
//     } catch (err) {
//       console.error('Error fetching profile:', err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  
// // Login route
// router.post('/login', async (req, res) => {
//     const { firebaseId, email, fullName, provider } = req.body;

  
//     try {
//       if (!firebaseId || !email) {
//         return res.status(400).json({ message: 'Missing firebaseId or email' });
//       }
  
//       let user = await Profile.findOne({ firebaseId });
  
//       if (!user) {
//         // New user: create an entry in MongoDB
//         user = new Profile({ firebaseId, email, fullName, provider });

//         await user.save();
  
//         return res.status(200).json({
//           message: 'New user created',
//           token: generateFakeToken(firebaseId), // implement this or use JWT
//           isNewUser: true
//         });
//       }
  
//       // Existing user
//       return res.status(200).json({
//         message: 'Login successful',
//         token: generateFakeToken(firebaseId), // replace with real JWT if needed
//         isNewUser: false
//       });
  
//     } catch (err) {
//       console.error('Login error:', err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  
//   // Fake token generator (for demo only)
//   function generateFakeToken(uid) {
//     return `fake-token-${uid}`;
//   }
  

// export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import JWT
import multer from 'multer';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import Profile from '../models/Profile.js';

dotenv.config();
const router = express.Router();

// Middleware: Verify JWT Token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Multer middleware for parsing file uploads (stored in memory)
const upload = multer();

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1'
});

// Upload function
const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: 're-assist-int',
    Key: `profile/${Date.now()}_${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  const data = await s3.upload(params).promise();
  return data.Location; // S3 URL
};

// Signup route
router.post('/register', async (req, res) => {
  const { email, password, confirmPassword, firebaseId } = req.body;

  try {
    // Validations
    if (!email || !password || !confirmPassword || !firebaseId) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await Profile.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const existingFirebase = await Profile.findOne({ firebaseId });
    if (existingFirebase) {
      return res.status(409).json({ message: 'Firebase ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Profile({
      email,
      password: hashedPassword,
      firebaseId
    });

    await newUser.save();

    // Generate JWT token after successful registration
    const token = jwt.sign({ firebaseId, email }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { firebaseId, email, fullName, provider } = req.body;

  try {
    if (!firebaseId || !email) {
      return res.status(400).json({ message: 'Missing firebaseId or email' });
    }

    let user = await Profile.findOne({ firebaseId });

    if (!user) {
      // New user: create an entry in MongoDB
      user = new Profile({ firebaseId, email, fullName, provider });
      await user.save();
    }

    // Generate JWT token regardless of new or existing user
    const token = jwt.sign({ firebaseId, email }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      isNewUser: !user.fullName, // Example logic for checking profile completeness
      user
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile route (protected)
router.put(
  '/update-profile',
  verifyToken, // Protect this route
  upload.array('papers'),
  async (req, res) => {
    const {
      firebaseId,
      fullName,
      institution,
      position,
      researchInterests,
      bio,
      publications: publicationsJSON,
    } = req.body;

    try {
      const user = await Profile.findOne({ firebaseId });
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update basic info
      user.fullName = fullName || user.fullName;
      user.institution = institution || user.institution;
      user.position = position || user.position;
      user.researchInterests = researchInterests
        ? JSON.parse(researchInterests)
        : user.researchInterests;
      user.bio = bio || user.bio;

      // Publications and file upload
      const incomingPubs = publicationsJSON ? JSON.parse(publicationsJSON) : [];
      const uploadedFiles = req.files || [];

      const updatedPublications = await Promise.all(
        incomingPubs.map(async (pub, idx) => {
          const file = uploadedFiles[idx];
          if (file) {
            try {
              const fileUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype);
              return { ...pub, file: fileUrl };
            } catch (err) {
              console.error('S3 Upload Error:', err);
              return pub; // Return without file if upload fails
            }
          }
          return pub;
        })
      );

      user.publications = updatedPublications;

      await user.save();
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }
);

// Fetch user profile route (using GET method)
router.get('/profile', async (req, res) => {
  const { firebaseId } = req.query;

  try {
    const user = await Profile.findOne({ firebaseId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      fullName: user.fullName,
      institution: user.institution,
      position: user.position,
      researchInterests: user.researchInterests,
      bio: user.bio
    });

  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;