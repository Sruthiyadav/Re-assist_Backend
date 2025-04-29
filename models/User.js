// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, default: 'user' }, // e.g., 'user', 'admin'
//     verified: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
},
{ timestamps: true }
);

export default mongoose.model('User', userSchema);