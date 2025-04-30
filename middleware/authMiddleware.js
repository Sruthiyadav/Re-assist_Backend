// import jwt from 'jsonwebtoken';

// export default function (req, res, next) {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'Access denied. No token provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user data to the request object
//     next();
//   } catch (error) {
//     res.status(400).json({ message: 'Invalid token.' });
//   }
// }

import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token after "Bearer "

  // Verify the token
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach user data to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('JWT Verification Error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }

    return res.status(401).json({ message: 'Invalid token.' });
  }
}