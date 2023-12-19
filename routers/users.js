const express = require('express')
const router = express.Router();
const { newsletter, allusers, userById, updateUsers, deleteUsers, signup, login} = require('../controllers/users')

router.get('/all-users', allusers)
router.get('/users-by-id/:id', userById)

router.post('/signup', signup)
router.post('/login', login)

router.post('/newsletter',newsletter)

router.put('/update-users', updateUsers)
router.delete('/delete-users', deleteUsers)

module.exports = router;