// // models/Paper.js
// import mongoose from 'mongoose';

// const paperSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   url: { type: String }, // if URL upload
//   filePath: { type: String }, // if file uploaded to S3
//   firebaseId: { type: String, required: true },
//   uploadedAt: { type: Date, default: Date.now },
// });

// export default mongoose.model('Paper', paperSchema);


import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String }, // if file uploaded to S3 or external URL
  filePath: { type: String }, // Optional
  firebaseId: { type: String, required: true },
  abstract: { type: String }, // 🆕 New field
  keywords: [{ type: String }], // 🆕 New field
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Paper', paperSchema);
