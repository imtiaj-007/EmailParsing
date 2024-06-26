const express = require('express');
const { 
    googleAuth, 
    outlookAuth 
} = require('../controllers/user');
const router = express.Router();

router.get('/google', googleAuth);
router.get('/outlook', outlookAuth);

module.exports = router;