import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.firebaseId; // Extract user ID from token
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};