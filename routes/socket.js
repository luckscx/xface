var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendFile('index', { title: 'X-Face' });
});


module.exports = router;
