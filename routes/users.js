import express from 'express';
import { register, login } from '../controllers/users.js'; // Import controller functions

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login an existing user
router.post('/login', login);


export default router;