import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from "cors";
import paperRoutes from './routes/papers.js';
import projectsRoutes from './routes/projects.js';
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


  app.use('/api/papers', paperRoutes);
  app.use('/api/projects', projectsRoutes);
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  