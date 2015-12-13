/* jshint node:true*/
"use strict";

var redisMgr = require('../redis/redisMgr.js');
var util = require('util');
var path = require('path');
var fs = require('fs');

var imgfile = {};

var uploadDir = path.join(__dirname + '/../public/');


if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
} 

var pic_index_key = 'PIC_INDEX';

function pad(num, size) {
    var s = num+"";
    while (s.length < size){
        s = "0" + s;
    }
    return s;
}

imgfile.newFile = function(cb) {
    redisMgr.incr(pic_index_key,function(err,val) {
        if (!err && val > 0) {
            var fileName = util.format('upload/%s.jpg',pad(val,5));
            console.log(fileName);
            var saveFile = imgfile.fullname(fileName);
            cb(null,saveFile);
        }else{
            console.error('redis error');
            cb(-1);
        }
        
    });
};

imgfile.getName = function(fullname) {
    return fullname.slice(uploadDir.length);
};

imgfile.fullname = function(frontname) {
    var fullname = path.join(uploadDir,frontname);
    return fullname;
};

module.exports = imgfile;

