import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['general', 'bug', 'feature', 'content', 'other'],
  },
  rating: {
    type: Number,
    required: function () {
      return this.type !== 'feature'; // rating is not required for features
    },
  },
  text: {
    type: String,
    required: function () {
      return this.type !== 'feature'; // text is not required for features
    },
  },
  // Feature-specific fields
  featureTitle: {
    type: String,
    required: function () {
      return this.type === 'feature';
    },
  },
  featureDescription: {
    type: String,
    required: function () {
      return this.type === 'feature';
    },
  },
  featurePriority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;