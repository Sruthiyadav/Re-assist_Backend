// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import paperRoutes from './routes/papers.js';
// import projectsRoutes from './routes/projects.js';
// import feedbackRoutes from './routes/feedback.js';
// import userRoutes from './routes/users.js';
// import bibRoutes from "./routes/bib.js";
// import fileUpload from 'express-fileupload';
// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(cors());
// app.use(fileUpload());


// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log("MongoDB connection error:", err));

// app.use('/api/papers', paperRoutes);
// app.use('/api/projects', projectsRoutes);
// app.use('/api/feedback', feedbackRoutes); // Use feedback routes
// app.use('/api/users', userRoutes);
// app.use("/api/bib", bibRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import paperRoutes from './routes/papers.js';
import projectsRoutes from './routes/projects.js';
import feedbackRoutes from './routes/feedback.js';
import userRoutes from './routes/users.js';
import profileRoutes from './routes/profiles.js';
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
app.use('/api/profiles', profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
