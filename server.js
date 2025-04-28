import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import paperRoutes from './routes/papers.js';
import projectsRoutes from './routes/projects.js';
import feedbackRoutes from './routes/feedback.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use('/api/papers', paperRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/feedback', feedbackRoutes); // Use feedback routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
