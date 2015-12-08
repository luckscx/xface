/* jshint node:true*/
"use strict";

var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var util = require('util');
var formidable = require('formidable');
var router = express.Router();
var redisMgr = require('../redis/redisMgr.js');

router.get('/get', function(req, res) {
});


module.exports = router;

