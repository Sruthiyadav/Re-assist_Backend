// import mongoose from 'mongoose';

// const projectSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // Name of the project
//   firebaseId: { type: String, required: true },
//   papers: [
//     {
//       _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }, // Reference to Paper model
//       title: { type: String, required: true },
//       url: { type: String },
//       uploadedAt: { type: Date, default: Date.now },
//     },
//   ],
//   bibEntries: [
//     {
//       entryType: { type: String, required: true },
//       citationKey: { type: String, required: true },
//       fields: { type: Object, required: true }, // Fields is marked as required
//     },
//   ],
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model('Project', projectSchema);

// import mongoose from 'mongoose';

// const projectSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // Name of the project
//   firebaseId: { type: String, required: true },
//   papers: [
//     {
//       _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }, // Reference to Paper model
//       title: { type: String, required: true },
//       url: { type: String },
//       uploadedAt: { type: Date, default: Date.now },
//     },
//   ],
//   bibEntries: [
//     {
//       // Allow any structure for .bib entries
//       entry: { type: Object, required: true },
//     },
//   ],
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model('Project', projectSchema);

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
        filePath: { type: String },
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