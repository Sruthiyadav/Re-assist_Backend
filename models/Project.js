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

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the project
  firebaseId: { type: String, required: true },
  papers: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }, // Reference to Paper model
      title: { type: String, required: true },
      url: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  bibEntries: [
    {
      // Allow any structure for .bib entries
      entry: { type: Object, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);