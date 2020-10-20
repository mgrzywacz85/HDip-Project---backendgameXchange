const express = require('express');
const router = express.Router();

//route:        GET api/user/profile
//desc:         Profile per user
//access:       Private
router.get('/', (req,res) => res.send('User profile route'));

module.exports = router;