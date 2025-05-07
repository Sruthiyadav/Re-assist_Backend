import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const PublicationSchema = new Schema({
  title: String,
  journal: String,
  year: Number,
  authors: String,
  file: String // File URL stored from S3
});

const ProfileSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return this.provider === 'local';
    }
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github', 'facebook'],
    default: 'local'
  },
  providerData: {
    type: Object
  },
  firebaseId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: String,
  institution: String,
  position: String,
  researchInterests: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ''
  },
  publications: [PublicationSchema], // Define publications with a sub-schema
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Profile = model('Profile', ProfileSchema);
export default Profile;