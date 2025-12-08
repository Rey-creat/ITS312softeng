const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUser } = require('../controllers/userController');

// Get all users
router.get('/', getAllUsers);
// Create user
router.post('/', require('../controllers/userController').createUser);
// Delete user by id
router.delete('/:id', deleteUser);
// Update user by id
router.put('/:id', updateUser);

module.exports = router;
