const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-bot-wa';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ error: 'Token required' });
  }

  const token = authHeader.split(' ')[1]; // format: "Bearer <token>"

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded; // simpan data user ke req.user
    next();
  });
}

module.exports = verifyToken;
