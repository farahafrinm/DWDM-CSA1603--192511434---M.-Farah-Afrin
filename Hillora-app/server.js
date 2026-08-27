const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err.message);
  } else {
    console.log('Connected to heritage_tourism database successfully!');
  }
});

app.get('/', (req, res) => {
  res.send('Hillora backend is running.');
});

app.get('/api/stations', (req, res) => {
  db.query('SELECT * FROM hillstation_master', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});
app.get('/api/tourism', (req, res) => {
  db.query('SELECT * FROM tourism_data', (err, results) => {
    if (err) { res.status(500).json({ error: err.message }); }
    else { res.json(results); }
  });
});
app.get('/api/biodiversity', (req, res) => {
  db.query('SELECT * FROM biodiversity_data', (err, results) => {
    if (err) { res.status(500).json({ error: err.message }); }
    else { res.json(results); }
  });
});
app.get('/api/community', (req, res) => {
  db.query('SELECT * FROM community_data', (err, results) => {
    if (err) { res.status(500).json({ error: err.message }); }
    else { res.json(results); }
  });
});
app.get('/api/damage', (req, res) => {
  db.query('SELECT * FROM damage_threat', (err, results) => {
    if (err) { res.status(500).json({ error: err.message }); }
    else { res.json(results); }
  });
});

app.get('/api/preservation', (req, res) => {
  db.query('SELECT * FROM preservation_data', (err, results) => {
    if (err) { res.status(500).json({ error: err.message }); }
    else { res.json(results); }
  });
});
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Account created successfully!' });
      }
    }
  );
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(401).json({ error: 'User not found' });
    } else {
      const user = results[0];
      const passwordMatches = bcrypt.compareSync(password, user.password_hash);
      if (passwordMatches) {
        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful!', token: token });
      } else {
        res.status(401).json({ error: 'Incorrect password' });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});