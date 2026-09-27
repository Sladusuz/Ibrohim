require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { ensureAdminAccount } = require('./utils/auth');
const { readContent } = require('./utils/content');

ensureAdminAccount();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  const content = readContent();
  res.render('index', { content });
});

app.listen(PORT, () => {
  console.log(`IMPRO portfolio running on http://localhost:${PORT}`);
});
