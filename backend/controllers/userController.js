const db = require('../db');

// GET all users
exports.getAllUsers = (req, res) => {
  db.query('SELECT id, fullname, email, role, department, status FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.status(200).json(results);
  });
};

// CREATE user
exports.createUser = (req, res) => {
  const { fullname, email, password, role, department, status } = req.body;
  if (!fullname || !email || !password || !role) {
    return res.status(400).json({ message: 'Full name, email, password, and role are required.' });
  }
  const bcrypt = require('bcrypt');
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password', error: err });
    db.query(
      'INSERT INTO users (fullname, email, password, role, department, status) VALUES (?, ?, ?, ?, ?, ?)',
      [fullname, email, hashedPassword, role, department || null, status || 'Active'],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err });
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
      }
    );
  });
};

// DELETE user by id
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  });
};

// UPDATE user by id
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { fullname, email, role, department, status } = req.body;
  db.query(
    'UPDATE users SET fullname = ?, email = ?, role = ?, department = ?, status = ? WHERE id = ?',
    [fullname, email, role, department, status, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'User updated successfully' });
    }
  );
};
