/* jshint node:true*/
"use strict";

var redis_client = require('redis').createClient();
redis_client.auth('xface@tencent');


module.exports = redis_client;



