/* jshint node:true*/
"use strict";

var redis_port = 7903;

var redis_client = require('redis').createClient(redis_port,'127.0.0.1');


module.exports = redis_client;



