const express = require('express');
const router = express.Router();

//route:        GET api/auth
//desc:         Authentication
//access:       Private
router.get('/', (req,res) => res.send('Auth'));

module.exports = router;