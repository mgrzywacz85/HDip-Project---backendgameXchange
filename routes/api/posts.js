const express = require('express');
const router = express.Router();

//route:        GET api/posts
//desc:         All public posts
//access:       Public
router.get('/', (req,res) => res.send('Posts'));

module.exports = router;