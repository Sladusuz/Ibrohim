const express = require('express');
const { verifyCredentials, signSession } = require('../utils/auth');

const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = signSession(username);
  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.json({ ok: true, username });
});

router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ ok: true });
});

module.exports = router;
