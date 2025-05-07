import express from 'express';
import Feedback from '../models/feedback.js';

const router = express.Router();

// POST endpoint to submit feedback (general or feature)
router.post('/', async (req, res) => {
  console.log("Received feedback:", req.body);

  const { type, rating, text, featureTitle, featureDescription, featurePriority } = req.body;

  try {
    const newFeedback = new Feedback({
      type,
      rating: type !== 'feature' ? rating : undefined,
      text: type !== 'feature' ? text : undefined,
      featureTitle: type === 'feature' ? featureTitle : undefined,
      featureDescription: type === 'feature' ? featureDescription : undefined,
      featurePriority: type === 'feature' ? featurePriority : undefined,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Failed to save feedback.' });
  }
});

export default router;