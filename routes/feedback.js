import express from 'express';
import Feedback from '../models/feedback.js';

const router = express.Router();

// POST endpoint to submit feedback
router.post('/', async (req, res) => {
  // Log the incoming request body to check if the data is received
  console.log("Received feedback:", req.body);

  const { type, rating, text } = req.body;

  try {
    const newFeedback = new Feedback({
      type,
      rating,
      text,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Failed to save feedback.' });
  }
});

export default router;
