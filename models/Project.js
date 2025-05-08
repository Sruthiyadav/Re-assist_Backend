import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firebaseId: { type: String, required: true },
  papers: {
    type: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
        title: { type: String, required: true },
        url: { type: String },
        abstract:{ type: String },
        keywords: { type: [String], default: [] }, // Recommended for multiple keywords
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    default: [], // Default to an empty array
  },
  bibEntries: {
    type: [
      {
        entry: { type: Object, required: true }, // Store the parsed .bib entry
        addedAt: { type: Date, default: Date.now },
      },
    ],
    default: [], // Default to an empty array
  },
  documents: [  // <-- NEW FIELD
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      url: String,
      uploadedAt: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);