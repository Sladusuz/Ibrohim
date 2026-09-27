const { verifySession } = require('../utils/auth');

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.session;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.admin = session;
  next();
}

module.exports = { requireAuth };
