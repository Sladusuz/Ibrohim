const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');

const { requireAuth } = require('../middleware/auth');
const { readContent, writeContent } = require('../utils/content');
const { verifyCredentials, setPassword } = require('../utils/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'public', 'assets', 'img', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase()));
  },
});

router.use(requireAuth);

router.get('/me', (req, res) => {
  res.json({ username: req.admin.username });
});

router.get('/content', (req, res) => {
  res.json(readContent());
});

router.put('/content', (req, res) => {
  const content = req.body;
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Invalid content payload' });
  }
  writeContent(content);
  res.json({ ok: true });
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No valid image uploaded' });
  }
  res.json({ url: `/assets/img/uploads/${req.file.filename}` });
});

router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  if (!verifyCredentials(req.admin.username, currentPassword)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  setPassword(newPassword);
  res.json({ ok: true });
});

module.exports = router;
