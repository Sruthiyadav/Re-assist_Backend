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