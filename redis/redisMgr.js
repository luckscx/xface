/* jshint node:true*/
"use strict";

var redis_client = require('redis').createClient(7903);
redis_client.auth('xface@tencent');


module.exports = redis_client;



