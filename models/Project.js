import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the project
  papers: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }, // Reference to Paper model
      title: { type: String, required: true },
      url: { type: String },
      filePath: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);