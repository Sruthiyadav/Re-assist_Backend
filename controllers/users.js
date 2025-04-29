// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// // Register a new user
// export const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create a new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     // Generate JWT token
//     const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     res.status(201).json({ user: newUser, token });
//   } catch (error) {
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// };

// // Login an existing user
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find the user by email
//     const existingUser = await User.findOne({ email });
//     if (!existingUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Validate password
//     const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
//     if (!isPasswordCorrect) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     res.status(200).json({ user: existingUser, token });
//   } catch (error) {
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// };

// import User from '../models/User.js';
// import jwt from 'jsonwebtoken';

// // Register a new user
// export const register = async (req, res) => {
//   try {
//     const { firebaseId, name, email } = req.body;

//     // Check if user already exists in the backend
//     const existingUser = await User.findOne({ firebaseId });
//     console.log("register:",existingUser)
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create a new user in the backend
//     const newUser = new User({
//       firebaseId,
//       name,
//       email,
//     });

//     await newUser.save();

//     // Generate JWT token
//     const token = jwt.sign({ firebaseId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(201).json({ user: newUser, token });
//   } catch (error) {
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// };

// // Login an existing user
// export const login = async (req, res) => {
//   try {
//     const { firebaseId, email } = req.body;

//     // Find the user by Firebase ID
//     const existingUser = await User.findOne({ firebaseId });

//     console.log("login:",existingUser)
//     if (!existingUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ firebaseId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(200).json({ user: existingUser, token });
//   } catch (error) {
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// };

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req, res) => {
  try {
    const { firebaseId, name, email } = req.body;

    // Check if user already exists in the backend
    const existingUser = await User.findOne({ firebaseId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user in the backend
    const newUser = new User({
      firebaseId,
      name,
      email,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ firebaseId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login an existing user
export const login = async (req, res) => {
  try {
    const { firebaseId, email } = req.body;

    // Find the user by Firebase ID
    const existingUser = await User.findOne({ firebaseId });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign({ firebaseId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ user: existingUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};