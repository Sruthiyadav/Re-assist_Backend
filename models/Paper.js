// models/Paper.js
import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String }, // if URL upload
  filePath: { type: String }, // if file uploaded to S3
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Paper', paperSchema);
