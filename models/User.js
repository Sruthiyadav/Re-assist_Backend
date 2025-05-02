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